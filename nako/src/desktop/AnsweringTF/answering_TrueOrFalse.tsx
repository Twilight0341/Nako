import * as React from "react";
import "./AnsweringTF.scss";
import RoundTimer from "../RoundTimer/RoundTimer";
import TimerBack from "./Group_815.svg";
import NakoAPI, {
  QuestionInfo,
  QuestionEndRequest,
  MultipleChoiceQuestion,
} from "../../modules/websocket-messages";

export interface Props {
  connection: NakoAPI;
  questionInfo: QuestionInfo<"student", MultipleChoiceQuestion>;
  correctAnswer?: QuestionEndRequest;
  currentQuestionProps: number;
}

interface State {
  imgRef: React.RefObject<HTMLImageElement>;
  targetTimerSize: number;
  resizeObserver: ResizeObserver;
  userAnswer: number;
  changeColor: number;
}

class Answering_TF extends React.Component<Props, State> {
  static defaultProps = {
    question: "2 x 2 = ?",
    timeLimit: 120,
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
    };
  }

  componentWillUnmount() {
    this.state.resizeObserver.disconnect();
  }

  componentDidUpdate(Props: Props) {
    if (
      this.props.correctAnswer?.correctAnswer !== undefined &&
      this.state.userAnswer !== 7
    ) {
      if (
        this.props.correctAnswer?.correctAnswer[0] === this.state.userAnswer
      ) {
        this.props.connection.send({
          method: "req",
          type: "answer_question",
          payload: {
            choice: this.state.userAnswer,
            currentQuestionCheck: this.props.currentQuestionProps,
          },
        });
        this.setState({ changeColor: 1 });
      } else {
        this.props.connection.send({
          method: "req",
          type: "answer_question",
          payload: {
            choice: this.state.userAnswer,
            currentQuestionCheck: this.props.currentQuestionProps,
          },
        });
        this.setState({ changeColor: 2 });
      }
    }
  }

  render() {
    return (
      <div className="AnsweringTF-background-wrapper">
        <div className="AnsweringTF-Grid-wrapper">
          {/*The left grid*/}
          <div className="AnsweringTF-left">
            <div className="AnsweringTF-left-inline">
              <div className="AnsweringTF-back-box">
                <button className="AnsweringTF-back-button">
                  <span className="arrow-left" />
                  <span>Back</span>
                </button>
                <div className="AnsweringTF-left-flex">
                  <p className="AnsweringTF-question-content">
                    {this.props.questionInfo.question}
                  </p>
                  <div className="AnsweringTF-left-icon-box">
                    <p className="AnsweringTF-question-icon1">Answer</p>
                    <p className="AnsweringTF-question-icon2">Answer</p>
                  </div>
                  <p className="AnsweringTF-question-text">
                    Click to choose the answer
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/*The right grid*/}
          <div className="AnsweringTF-right">
            <div className="AnsweringTF-right-timer-box">
              <div
                className="
                 AnsweringTF-Right-timer-background-wrapper"
              >
                <img
                  ref={this.state.imgRef}
                  className="AnsweringTF-right-timer-background"
                  src={TimerBack}
                  alt="I am"
                  onLoad={(e) =>
                    this.state.resizeObserver.observe(e.currentTarget)
                  }
                />
                <RoundTimer
                  className="background-wrapper"
                  time={this.props.questionInfo.timeLimit}
                  timerSize={this.state.targetTimerSize - 60}
                />
              </div>
              {/* <div className="AnsweringTF-Timer">
              </div> */}
            </div>
            <div className="AnsweringTF-muti-wrapper">
              {this.props.questionInfo.choices.map((value, index) => {
                return (
                  <button
                    className="AnsweringsMC-button"
                    onClick={() => {
                      this.setState({ userAnswer: index }, () => {
                        console.log(this.state.userAnswer);
                      });
                      this.props.connection.send({
                        method: "req",
                        type: "answer_question",
                        payload: {
                          choice: this.state.userAnswer,
                          currentQuestionCheck: this.props.currentQuestionProps,
                        },
                      });
                      console.log(this.props.currentQuestionProps);
                    }}
                    style={
                      this.state.changeColor === 1
                        ? { border: "7px solid green" }
                        : this.state.changeColor === 2
                        ? { border: "7px solid red" }
                        : { border: "7px solid #4ed02c" }
                    }
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* <div className="warn">content: "mobile not supported yet";</div> */}
      </div>
    );
  }
}

export default Answering_TF;
