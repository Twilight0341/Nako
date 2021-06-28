import React from "react";
import { CSSTransition } from "react-transition-group";
import Monster from "../../assets/monsters/monster";
import { AccountInfo } from "../../modules/account-info";
import NakoAPI, {
  AccountRole,
  GameEndRequest,
  GameInfo,
  QuestionEndRequest,
} from "../../modules/websocket-messages";
import { animate, delay } from "../../utils/utils";
import AnsweringModule from "../AnsweringMC/answeringModule";
import styles from "./game.module.scss";
import WinSound from "./Nako Win.wav";
import FailSound from "./Nako Wrong.wav";
import Result from "./result";


interface GameProps extends React.HTMLAttributes<HTMLDivElement> {
  connection: NakoAPI;
  accountInfo: AccountInfo;
  gameInfo: GameInfo<AccountRole>;
}

interface GameState {
  questionCount: number;
  currentQuestion: number;
  currentPhase: GamePhase;
  questionNumberElement: React.RefObject<HTMLHeadingElement>;
  //resultScrollDiv: React.RefObject<HTMLDivElement>;
  //sequentialDisplayCounter: number;
  monsterRef: React.RefObject<Monster>;
  showResult: boolean;
  onSlideAnimComplete?: (value: void | PromiseLike<void>) => void;
  correctAnswer?: QuestionEndRequest;
  result?: GameEndRequest;
}

enum GamePhase {
  Transition,
  Active,
  Ended,
}

export default class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props);

    this.state = {
      questionCount: 0,
      currentQuestion: -1,
      currentPhase: this.props.accountInfo.role === "student" ? GamePhase.Transition : GamePhase.Active,
      questionNumberElement: React.createRef<HTMLHeadingElement>(),
      //resultScrollDiv: React.createRef<HTMLDivElement>(),
      //sequentialDisplayCounter: 0,
      monsterRef: React.createRef<Monster>(),
      showResult: false,
      result: [{
        name: "Test1",
        score: 0
      }, {
        name: "Test2",
        score: 1
      }, {
        name: "Test3",
        score: 2
      }, {
        name: "Test4",
        score: 3
      }, {
        name: "Test5",
        score: 4
      }]
    };

    this.props.connection.subscribe("req", "game_end").then((msg) => {
      this.props.connection.send({
        method: "res",
        type: "game_end",
        payload: null,
      });
  
      console.log("Game ended");
      console.log(msg);
  
      this.setState(
        { currentPhase: GamePhase.Ended, result: [...msg].sort((a, b) => b.score - a.score), showResult: true },
        () => {
          if (this.state.result!.indexOf(this.state.result!.filter(i => i.name === this.props.accountInfo.name)[0]) <= 2) {
            // Play win Audio 
            this.play(WinSound);
          } else {
            // Play loss audio
            this.play(FailSound);
          }
        }
      );
    });

    this.props.accountInfo.role === "student" ? this.studentFlow() : this.teacherFlow();

    (window as any).toggleSequentialDisplay = () => this.setState({ showResult: !this.state.showResult });
  }

  play = (music: string) => {
    let audio = new Audio(music);
    audio.play();
  };

  studentFlow = () => {
    console.log("subbing");
    this.props.connection.subscribe("req", "game_update").then(async (msg) => {
    this.setState({ currentPhase: GamePhase.Transition });
    await new Promise<void>(
      res => this.setState({ onSlideAnimComplete: res }, 
      () => console.log("Waiting for slide-in animation to complete"))
    );

    this.setState({
      questionCount: this.state.questionCount + 1,
      currentQuestion: msg.currentQuestion,
    });

    if (this.state.questionNumberElement.current) {
      await animate("bounce", this.state.questionNumberElement.current, 500);
    } else {
      console.warn("questionNumberElement was not found in DOM");
    }

    this.props.connection.send({
      method: "res",
      type: "game_update",
      payload: null,
    });

    this.props.connection.subscribe("req", "question_start").then(() => {
      this.props.connection.send({
        method: "res",
        type: "question_start",
        payload: null,
      });

      console.log("Question started");
      this.setState({ currentPhase: GamePhase.Active, correctAnswer: undefined });

      this.props.connection.subscribe("req", "question_end").then((msg) => {
        this.props.connection.send({
          method: "res",
          type: "question_end",
          payload: null,
        });

        console.log("Question ended");
        this.setState({ correctAnswer: msg });

        if (this.state.currentPhase !== GamePhase.Ended) {
          this.studentFlow();
        }
      });
    });
  });
}
  teacherFlow = () => {
    this.props.connection.subscribe("req", "game_update", payload => {
      this.setState({ currentQuestion: payload.currentQuestion });

      this.props.connection.send({
        method: "res",
        type: "game_update",
        payload: null
      });
    });

    this.props.connection.subscribe("req", "question_end", payload => {
      this.state.monsterRef.current?.changeHealth(-payload.stats.correct / this.props.gameInfo.questions.length);

      this.props.connection.send({
        method: "res",
        type: "question_end",
        payload: null
      });
    });
  }

  render() {
    const { connection, accountInfo, gameInfo, ...rest } = this.props;
    let renderTarget: JSX.Element;

    switch (this.state.currentPhase) {
      case GamePhase.Transition:
        renderTarget = (
          <div className="fill-parent" id={styles.transition}>
            <CSSTransition
              in={true}
              appear={true}
              exit={false}
              timeout={1500}
              classNames={{
                appear: styles["slide-t2b-appear"],
                appearActive: styles["slide-t2b-appear-active"],
                appearDone: styles["slide-t2b-appear-done"]
              }}
              onEntered={async () => {
                console.log("Animation completed");

                let loggedWarning = false;

                while (!this.state.onSlideAnimComplete) {
                  if (!loggedWarning) {
                    console.log("There was no promise to resolve, forcing delay for one...");
                    loggedWarning = true;
                  }

                  await delay(200);
                }

                this.state.onSlideAnimComplete();
              }}
            >
              <span>
                <h1>Question </h1>
                <h1 ref={this.state.questionNumberElement}>
                  {this.state.questionCount.toString()}
                </h1>
              </span>
            </CSSTransition>
          </div>
        );
        break;

      case GamePhase.Active:
        renderTarget = this.props.accountInfo.role === "student" ?
          // TODO: Make Answering page generic
          <AnsweringModule
            connection={this.props.connection}
            questionInfo={
              this.props.gameInfo.questions[this.state.currentQuestion]
            }
            correctAnswer={this.state.correctAnswer}
            currentQuestionProps={this.state.currentQuestion}
          /> :
          <div id={styles["monster-container"]} className="fill-parent">
            <div>
              <div>
                <button><span className="arrow-left"/><span>Back</span></button>
                <span>Question: {this.state.currentQuestion + 1}</span>
              </div>
              <Monster ref={this.state.monsterRef} id={styles.monster}/>
            </div>
            <div>
              <span>{this.state.currentQuestion !== -1 ? this.props.gameInfo.questions[this.state.currentQuestion].question : "Waiting for question..."}</span>
            </div>
          </div>;
        break;

      default:
        renderTarget = <Result in={this.state.showResult} data={this.state.result}/>;
        break;
    }

    return <div {...rest}>{renderTarget}</div>;
  }
}
