import React from "react";
import Select from "react-select";
import ScoreSelector from "./selector/ScoreSelector";
import TimeSelector from "./selector/TimeSelector";
import styles from "./teacher.module.scss";

interface QuestionEditProps {
  currentQuestion: {
    question: string;
    type: string;
    choices: string[];
    timeLimit: number;
    corr: number[];
  };
  minsValuePass: (value: number) => void;
  secsValuePass: (value: number) => void;
  scoreValuePass: (value: number) => void;
  questionRefPass: (value: React.RefObject<HTMLInputElement>) => void;
  onSelectionChange: (value: {
    label: string,
    value: string
  } | null) => void,
  data: {
    label: string;
    value: string;
  }[],
  keep: () => void;
  onQuestionInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  renderTarget: JSX.Element;
  mcRefs: [
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> }
  ];
  tfRefs: [React.RefObject<HTMLInputElement>, React.RefObject<HTMLInputElement>];
}

interface QuestionEditState {
  dropDownRef: React.RefObject<Select<{ label: string; value: string; }>>;
  questionRef: React.RefObject<HTMLInputElement>;
  timeSelectorRef: React.RefObject<TimeSelector>;
  tempDropDownValue?: { label: string, value: string };
  selectionChangeState: {
    label: string | undefined;
    value: string | undefined;
  };
}
export default class QuestionEdit extends React.Component<QuestionEditProps, QuestionEditState> {
  constructor(props: QuestionEditProps) {
    super(props);

    this.state = {
      dropDownRef: React.createRef<Select<{ label: string; value: string; }>>(),
      questionRef: React.createRef<HTMLInputElement>(),
      timeSelectorRef: React.createRef<TimeSelector>(),
      selectionChangeState: {
        label: "Multiple Choices", value: "Multiple"
      },
    };
  }
  
  componentDidUpdate(prevProps: QuestionEditProps) {
    try {
      if (prevProps.currentQuestion !== this.props.currentQuestion) {
        // this.state.dropDownRef.current!.setState({ value: this.props.currentQuestion.type === "Multiple" ? this.props.data[0] : this.props.data[1] });
        this.setState({ tempDropDownValue: this.props.currentQuestion.type === "Multiple" ? this.props.data[0] : this.props.data[1] }, () => {
          this.setState({ tempDropDownValue: undefined });
          this.state.timeSelectorRef.current!.setState({
            secsValue: this.props.currentQuestion.timeLimit % 60,
            minsValue: Math.floor(this.props.currentQuestion.timeLimit / 60)
          });
          this.state.questionRef.current!.value = this.props.currentQuestion.question;

          if (this.props.currentQuestion.type === "Multiple") {
            for (let i = 0; i < this.props.mcRefs.length; i++) {
              this.props.mcRefs[i].text.current!.value = this.props.currentQuestion.choices[i] ?? "";
              this.props.mcRefs[i].checkbox.current!.checked = false;
            }
    
            if (typeof this.props.currentQuestion.corr === "number") {
              this.props.mcRefs[this.props.currentQuestion.corr - 1].checkbox.current!.checked = true;
            } else {
              for (const i of this.props.currentQuestion.corr) {
                this.props.mcRefs[i].checkbox.current!.checked = true;
              }
            }
          } else {
            // I'm assuming that corr is either 0/1 if the type is T/F
            console.log(this.props.currentQuestion.corr);
            console.log(this.props.tfRefs);
            this.props.tfRefs[0].current!.checked = this.props.currentQuestion.corr[0] === 0 ? true : false;
            this.props.tfRefs[1].current!.checked = this.props.currentQuestion.corr[0] === 1 ? true : false;
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

 deactivateAll() {
  console.log("go");
   console.log(this.state.questionRef.current);
  switch(this.state.selectionChangeState.value) {
    case "Multiple":
      console.log("come");
      if (this.state.questionRef.current) {
        this.state.questionRef.current!.value = "";
      }
  
      for (let i = 0; i < this.props.mcRefs.length; i++) {
        if (this.props.mcRefs[i].text.current) {
          this.props.mcRefs[i].text.current!.value = "";
        }
  
        if (this.props.mcRefs[i].checkbox.current) {
          this.props.mcRefs[i].checkbox.current!.checked = false;
        }
        
      }
    break;
    case "True/False":
      console.log("in");
      if (this.state.questionRef.current) {
        this.state.questionRef.current!.value = "";
      }
  
      for (let i = 0; i < this.props.tfRefs.length; i++) {
        if (this.props.tfRefs[i].current) {
          this.props.tfRefs[i].current!.checked = false;
          console.log(this.props.tfRefs[i]);
        }
        
      } 
    break;
  }
    
  }

  render() {
    return (
      <div id={styles["background-wrapper"]}>
        <div id={styles["timer"]}>
          <TimeSelector
            ref={this.state.timeSelectorRef}
            minsValuePass={value => this.props.minsValuePass(value)}
            secsValuePass={value => this.props.secsValuePass(value)}
          />
        </div>
        <div id={styles["scorer"]}>
          <ScoreSelector scoreValuePass={value => this.props.scoreValuePass(value)} />
        </div>
        <div id={styles["selector"]}>
        <button
            id={styles["Next-button"]}
            onClick={() => {
              this.props.keep();
              this.deactivateAll();
            }}
          >
            New Question
          </button>
          <Select
            ref={this.state.dropDownRef}
            id={styles["select"]}
            defaultValue={{ label: "Multiple Choices", value: "Multiple" }}
            //value={this.state.selectedOption}
            value={this.state.tempDropDownValue}
            onChange={value => {this.props.onSelectionChange(value); this.setState({selectionChangeState: {
              label: value?.label,
              value: value?.value,
            }, }, ()=>{console.log(this.state.selectionChangeState);});}}
            options={this.props.data}
          />
        </div>
        <div id={styles["inputer"]}>
          <input
            ref={this.state.questionRef}
            placeholder="Add Question..."
            id={styles["question-input"]}
            type="text"
            onChange={e => {
              this.props.onQuestionInputChange(e);
              this.props.questionRefPass(this.state.questionRef);
            }}
          />
        </div>
        {this.props.renderTarget}
      </div>
    );
  }
}
