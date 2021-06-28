import * as React from "react";
import CSS from "csstype";
import style from "./AnsweringMC.module.scss";
import RoundTimer from "../RoundTimer/RoundTimer";
import TimerBack from "./Group_816.svg";
import NakoAPI, {
  QuestionInfo,
  QuestionEndRequest,
  Question,
  QuestionType,
} from "../../modules/websocket-messages";
import CorrectSound from "./Nako Correct.wav";
import WrongSound from "./Nako Fail.wav";
import MCModule from "./MultipleChoiceModule";

export interface Props {
  correctAnswer?: QuestionEndRequest;
  connection: NakoAPI;
  questionInfo: QuestionInfo<"student", Question<QuestionType>>;
  currentQuestionProps: number;
  timing?: (fn: () => void) => void;
}

interface State {
  imgRef: React.RefObject<HTMLImageElement>;
  targetTimerSize: number;
  resizeObserver: ResizeObserver;
  userAnswer: number;
  changeColor: number;
  sending: QuestionInfo<"student", Question<QuestionType>>;
  countCorrect: boolean;
  lockCorrect: boolean;
}

class AnsweringModule extends React.Component<Props, State> {
  static defaultProps = {
    question: "2 x 2 = ?",
    choices: [
      "What time is it? dasfadsadsfasdffhjkhjkjkhjklhjg",
      "What time is it? dasfadsadsfasdffhjkhjkjkhjklhjg",
      "What time is it? dasfadsadsfasdffhjkhjkjkhjklhjg",
      "What time is it? dasfadsadsfasdffhjkhjkjkhjklhjg",
      "What time is it? dasfadsadsfasdffhjkhjkjkhjklhjg",
      "What time is it? dasfadsadsfasdffhjkhjkjkhjklhjg",
    ],
    timeLimit: 120,
    correctAnswer: 0,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      imgRef: React.createRef<HTMLImageElement>(),
      targetTimerSize: 0,
      resizeObserver: new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === this.state.imgRef.current) {
            this.setState({ targetTimerSize: entry.contentRect.height - 12 });
          }
        }
      }),
      userAnswer: 7,
      changeColor: 0,
      sending: this.props.questionInfo,
      countCorrect: false,
      lockCorrect: false,
    };
  }

  componentDidMount() {
    this.Classify();
  }

  componentWillUnmount() {
    this.state.resizeObserver.disconnect();
    console.log("unmount");
  }

  componentDidUpdate(Props: Props) {
    if (this.state.userAnswer !== 7) {
      console.log("changed");
      console.log(this.props.correctAnswer?.correctAnswer);
    }
  }

  Play = (music: string) => {
    let audio = new Audio(music);
    audio.play();
  };

  Classify = () => {
    return this.props.questionInfo.type === "multiple_choice"
      ? this.setState({
          sending: this.props.questionInfo as QuestionInfo<
            "student",
            Question<"multiple_choice">
          >,
        })
      : console.log(
          this.props.questionInfo as QuestionInfo<
            "student",
            Question<"multiple_choice">
          >
        );
  };

  render() {
    return (
      <div id={style["background-wrapper"]}>
        <div id={style["Grid-wrapper"]}>
          {/*The left grid*/}
          <div id={style["left"]}>
            <div id={style["left-inline"]}>
              <div id={style["back-box"]}>
                <button id={style["back-button"]}>
                  <span id={style["arrow-left"]} />
                  <span>Back</span>
                </button>
                <div id={style["left-flex"]}>
                  <p id={style["question-content"]}>
                    {this.props.questionInfo.question}
                  </p>
                  <div id={style["left-icon-box"]}>
                    <p id={style["question-icon1"]}>Answer</p>
                    <p id={style["question-icon2"]}>Answer</p>
                  </div>
                  <p id={style["question-text"]}>Click to choose the answer</p>
                </div>
              </div>
            </div>
          </div>
          {/*The right grid*/}
          <div id={style["right"]}>
            <div id={style["right-timer-box"]}>
              <div id={style["right-timer-background-wrapper"]}>
                <img
                  ref={this.state.imgRef}
                  id={style["right-timer-background"]}
                  src={TimerBack}
                  alt="I am"
                  onLoad={(e) =>
                    this.state.resizeObserver.observe(e.currentTarget)
                  }
                />
                <RoundTimer
                  id={style["timer-background-wrapper"]}
                  time={this.props.questionInfo.timeLimit}
                  timerSize={this.state.targetTimerSize - 60}
                />
              </div>
              {/* <div id="AnsweringMC-Timer">
                </div> */}
            </div>
            <div>
              <MCModule
                connection={this.props.connection}
                correctAnswer={this.props.correctAnswer}
                currentQuestionProps={this.props.currentQuestionProps}
                countCorrect={this.state.countCorrect}
                questionInfo={
                  this.props.questionInfo.type === "multiple_choice"
                    ? (this.props.questionInfo as QuestionInfo<
                        "student",
                        Question<"multiple_choice">
                      >)
                    : (this.props.questionInfo as QuestionInfo<
                        "student",
                        Question<"multiple_choice">
                      >)
                }
                onAnswerSelected={(e) => {
                  this.setState({ userAnswer: e }, () => {
                    this.props.connection.send({
                      method: "req",
                      type: "answer_question",
                      payload: {
                        choice: this.state.userAnswer,
                        currentQuestionCheck: this.props.currentQuestionProps,
                      },
                    });
                  });
                }}
              />
            </div>
          </div>
        </div>
        {/* <div id="warn">content: "mobile not supported yet";</div> */}
      </div>
    );
  }
}

export default AnsweringModule;
