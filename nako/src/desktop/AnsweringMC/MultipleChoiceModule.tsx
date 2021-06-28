import React from "react";
import CSS from "csstype";
import style from "./AnsweringMC.module.scss";
import CorrectSound from "./Nako Correct.wav";
import WrongSound from "./Nako Fail.wav";
import NakoAPI, {
  QuestionInfo,
  QuestionEndRequest,
  Question,
} from "../../modules/websocket-messages";

export interface Props {
  correctAnswer?: QuestionEndRequest;
  connection: NakoAPI;
  questionInfo: QuestionInfo<"student", Question<"multiple_choice">>;
  currentQuestionProps: number;
  onAnswerSelected: (userAnswer: number) => void;
  countCorrect: boolean;
}

interface States {
  userAnswer: number;
  sending: boolean;
  checkPlay: boolean;
}

class MCModule extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      userAnswer: 7,
      sending: false,
      checkPlay: false,
    };

    console.log(props.questionInfo);
  }

  componentWillUnmount() {
    console.log("check pls: " + this.props.correctAnswer);
  }

  componentDidMount() {
    this.setState({ checkPlay: false });
  }

  componentWillUpdate() {
    console.log("check pls: " + this.props.correctAnswer);
  }

  normalAnswerStyle: CSS.Properties = {
    width: "45%",
    maxHeight: "50em",
    marginTop: "3%",
    flexShrink: 1,
    flexGrow: 1,
    color: "black",
    fontSize: "1.6em",
    textAlign: "center",
    padding: "2%",
    borderRadius: "50px",
    border: "7px solid #9650FF",
    background: "white",
    boxShadow:
      "10px 10px 10px rgba(0, 0, 0, 0.45),-10px -10px 10px rgba(255, 255, 255, 0.45)",
    transitionDuration: "0.3s",
    outline: "none",
  };

  correctAnswerStyle: CSS.Properties = {
    width: "45%",
    maxHeight: "50em",
    marginTop: "3%",
    flexShrink: 1,
    flexGrow: 1,
    color: "black",
    fontSize: "1.6em",
    textAlign: "center",
    padding: "2%",
    borderRadius: "50px",
    border: "7px solid lightgreen",
    background: "white",
    boxShadow:
      "10px 10px 10px rgba(0, 0, 0, 0.45),-10px -10px 10px rgba(255, 255, 255, 0.45)",
    transitionDuration: "0.3s",
    outline: "none",
  };

  wrongAnswerStyle: CSS.Properties = {
    width: "45%",
    maxHeight: "50em",
    marginTop: "3%",
    flexShrink: 1,
    flexGrow: 1,
    color: "black",
    fontSize: "1.6em",
    textAlign: "center",
    padding: "2%",
    borderRadius: "50px",
    border: "7px solid red",
    background: "white",
    boxShadow:
      "10px 10px 10px rgba(0, 0, 0, 0.45),-10px -10px 10px rgba(255, 255, 255, 0.45)",
    transitionDuration: "0.3s",
    outline: "none",
  };

  UserAnswerStyle: CSS.Properties = {
    width: "45%",
    maxHeight: "50em",
    marginTop: "3%",
    flexShrink: 1,
    flexGrow: 1,
    color: "black",
    fontSize: "1.6em",
    textAlign: "center",
    padding: "2%",
    borderRadius: "50px",
    border: "12px solid #FFA200",
    background: "white",
    boxShadow:
      "10px 10px 10px rgba(0, 0, 0, 0.45),-10px -10px 10px rgba(255, 255, 255, 0.45)",
    transitionDuration: "0.2s",
    outline: "none",
  };

  Play = (music: string) => {
    let audio = new Audio(music);
    audio.play();
  };

  CSSPicker = (index: number) => {
    if (
      this.props.correctAnswer?.correctAnswer === undefined &&
      this.state.sending !== true
    ) {
      return this.normalAnswerStyle;
    }
    if (
      this.props.correctAnswer?.correctAnswer === undefined &&
      this.state.sending === true &&
      this.state.userAnswer === index
    ) {
      return this.UserAnswerStyle;
    } else if (
      this.props.correctAnswer?.correctAnswer === undefined &&
      this.state.sending === true &&
      this.state.userAnswer !== index
    ) {
      return this.normalAnswerStyle;
    }

    if (this.props.correctAnswer !== undefined) {
      this.props.correctAnswer.correctAnswer.forEach((value, i) => {
        if (value === index && this.state.sending === true) {
          console.log(value);
          return this.correctAnswerStyle;
        } else if (value !== index && this.state.sending === true) {
          console.log(this.props.correctAnswer?.correctAnswer);
          return this.wrongAnswerStyle;
        }
      });
      if (
        this.props.correctAnswer.correctAnswer.find((value) => {
          return value === this.state.userAnswer;
        }) === this.state.userAnswer &&
        this.state.checkPlay === false
      ) {
        this.Play(CorrectSound);
        this.setState({ checkPlay: true });
        console.log("Correct");
      }
      // // } else if (
      // //   this.props.countCorrect !== true &&
      // //   this.state.checkPlay === false
      // ) {
      else if (
        this.props.correctAnswer.correctAnswer.find((value) => {
          return value === this.state.userAnswer;
        }) !== this.state.userAnswer &&
        this.state.checkPlay === false
      ) {
        this.Play(WrongSound);
        this.setState({ checkPlay: true });
        console.log("Wrong");
      }
    }
  };

  render() {
    return (
      <>
        <div id={style["muti-wrapper"]}>
          {this.props.questionInfo.choices.map((value, index) => {
            return (
              <button
                id={style["button"]}
                disabled={this.state.sending === true ? true : false}
                key={index}
                onClick={() => {
                  this.setState({ userAnswer: index, sending: true }, () => {
                    this.props.onAnswerSelected(this.state.userAnswer);
                    console.log("userAnswer: " + this.state.userAnswer);
                    console.log(
                      "correct Answer: " +
                        this.props.correctAnswer?.correctAnswer
                    );
                  });
                }}
                style={this.CSSPicker(index)}
              >
                {value}
              </button>
            );
          })}
        </div>
        <p>{this.props.correctAnswer?.correctAnswer}</p>
      </>
    );
  }
}

export default MCModule;
