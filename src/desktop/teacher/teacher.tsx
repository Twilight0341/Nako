import React from "react";
import { Link, Route, RouteChildrenProps } from "react-router-dom";
import { AccountInfo } from "../../modules/account-info";
import Logo from "../../modules/logo/logo";
import styles from "./teacher.module.scss";
import threeline from "./Group 842.svg";
import Quest from "./questmake";
import TimeSelector from "./selector/TimeSelector";
import ScoreSelector from "./selector/ScoreSelector";
import Select from "react-select";
import bossimg from "./monster-stay-unscreen.svg";
import Axios, { AxiosInstance } from "axios";
import QuestionEdit from "./question-edit";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper/core";
import Monster from "./monster-stay-unscreen.gif";
import Frong from "./oie_27192261q7gwKFt.gif";
import Mushroom from "./mushroom stand.gif";
import Dragon from "./red dragon.gif";
import Robo from "./robo.gif";
import SeaMon from "./sea monster.gif";

import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";

SwiperCore.use([Navigation]);

interface ProfileProps {
  accountInfo: AccountInfo;
}

interface ProfileState extends QuestionBankStates {
  resizeObserver: ResizeObserver;
  targetTopBarHeight: number;
  dataSet: {
    name: string;
    type: string;
    teacher: string;
  }[];
  AnswerSet: {
    question: string;
    type: string;
    choices: string[];
    timeLimit: number;
    corr: number[];
  }[];
  mins: number;
  secs: number;
  scores: number;
  selectedOption: {
    label: string;
    value: string;
  };
  clearDefaultValue: boolean;
  currentQuestionIdx: number;
  mcRefs: [
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> },
    { text: React.RefObject<HTMLInputElement>, checkbox: React.RefObject<HTMLInputElement> }
  ];
  tfRefs: [React.RefObject<HTMLInputElement>, React.RefObject<HTMLInputElement>];
  connection: AxiosInstance;
}

interface QuestionBankStates {
  AnswerSet: {
    question: string;
    type: string;
    choices: string[];
    timeLimit: number;
    corr: number | number[];
  }[];
  question: string;
  type: string;
  choices1: string;
  choices2: string;
  choices3: string;
  choices4: string;
  choices5: string;
  choices6: string;
  choices1check: number;
  choices2check: number;
  choices3check: number;
  choices4check: number;
  choices5check: number;
  choices6check: number;
  timeLimit: number;
  corr: number[];
  holdArray: number[];
  stayArray: string[];
  totalTime: number;
  TFAnswer: boolean[];
  declare: React.RefObject<HTMLInputElement>;
  questionEditRef: React.RefObject<QuestionEdit>;
  temoCase: boolean;
  currentSwiperIdx: number;
  newQuestionIdx: number;
  checkInitial: boolean;
  thenText: string;
}

export class Misstea extends React.Component<ProfileProps & React.HTMLAttributes<HTMLDivElement> & RouteChildrenProps, ProfileState> {
  constructor(props: ProfileProps & React.HTMLAttributes<HTMLDivElement> & RouteChildrenProps) {
    super(props);

    this.state = {
      resizeObserver: new ResizeObserver(entries => {
        for (const i of entries) {
          this.setState({ targetTopBarHeight: i.target.clientHeight });
        }
      }),
      targetTopBarHeight: 0,
      mins: 0,
      secs: 0,
      scores: 0,
      selectedOption: { label: "Multiple Choices", value: "Multiple" },
      currentQuestionIdx: 0,
      mcRefs: [
        { text: React.createRef<HTMLInputElement>(), checkbox: React.createRef<HTMLInputElement>() },
        { text: React.createRef<HTMLInputElement>(), checkbox: React.createRef<HTMLInputElement>() },
        { text: React.createRef<HTMLInputElement>(), checkbox: React.createRef<HTMLInputElement>() },
        { text: React.createRef<HTMLInputElement>(), checkbox: React.createRef<HTMLInputElement>() },
        { text: React.createRef<HTMLInputElement>(), checkbox: React.createRef<HTMLInputElement>() },
        { text: React.createRef<HTMLInputElement>(), checkbox: React.createRef<HTMLInputElement>() }
      ],
      tfRefs: [React.createRef<HTMLInputElement>(), React.createRef<HTMLInputElement>()],
      connection: Axios.create({
        baseURL: "http://localhost:5000/",
        timeout: 10000,
      }),
      ///////////////////////////////////
      AnswerSet: [
        // {
        //   question: "1 x 1 = ?",
        //   type: "Multiple Choices",
        //   choices: ["", "", "", ""],
        //   timeLimit: 0,
        //   corr: [],
        // },
      ],
      question: "",
      type: "Multiple",
      choices1: "",
      choices2: "",
      choices3: "",
      choices4: "",
      choices5: "",
      choices6: "",
      choices1check: 0,
      choices2check: 0,
      choices3check: 0,
      choices4check: 0,
      choices5check: 0,
      choices6check: 0,
      timeLimit: 0,
      corr: [],
      holdArray: [],
      stayArray: [],
      totalTime: 0,
      TFAnswer: [false, false],
      clearDefaultValue: false,
      declare: React.createRef<HTMLInputElement>(),
      temoCase: false,
      currentSwiperIdx: 0,
      newQuestionIdx: 0,
      checkInitial: false,
      thenText:"",
      ///////////////////////////////////

      dataSet: [
        {
          name: "Game 10",
          type: "Boss Fight",
          teacher: "Sum Ting Wong",
        },
        {
          name: "Game 11",
          type: "Boss Fight",
          teacher: "Amy Wong",
        },
        {
          name: "Game 12",
          type: "Boss Fight",
          teacher: "Lee Man Ho",
        },
        {
          name: "Game 13",
          type: "Boss Fight",
          teacher: "Lee Man Ho",
        },
        {
          name: "Game 14",
          type: "Boss Fight",
          teacher: "Amy Wong",
        },
        {
          name: "Game 15",
          type: "Boss Fight",
          teacher: "Sum Ting Wong",
        },
        {
          name: "Game 16",
          type: "Boss Fight",
          teacher: "Sum Ting Wong",
        },
        {
          name: "Game 17",
          type: "Boss Fight",
          teacher: "Lee Man Ho",
        },
        {
          name: "Game 18",
          type: "Boss Fight",
          teacher: "Amy Wong",
        },
        {
          name: "Game 19",
          type: "Boss Fight",
          teacher: "Sum Ting Wong",
        },
        {
          name: "Game 20",
          type: "Boss Fight",
          teacher: "Lee Man Ho",
        },
        {
          name: "Game 21",
          type: "Boss Fight",
          teacher: "Amy Wong",
        },
        {
          name: "Game 22",
          type: "Boss Fight",
          teacher: "Lee Man Ho",
        },
        {
          name: "Game 23",
          type: "Boss Fight",
          teacher: "Sum Ting Wong",
        },
        {
          name: "Game 24",
          type: "Boss Fight",
          teacher: "Amy Wong",
        },
      ],
      questionEditRef: React.createRef<QuestionEdit>()
    };
  }

  data = [
    { label: "Multiple Choices", value: "Multiple" },
    { label: "True or False", value: "True/False" },
  ];

  handleChange = (selectedOption: { label: string; value: string; } | null) => {
    if (selectedOption === null) {
      this.setState({ selectedOption: { label: "", value: "" } }, () =>
        console.log(`Option selected:`, this.state.selectedOption)
      );
      const olddata = this.state.AnswerSet;
      olddata.push({ question: "", type: "", choices: [""], timeLimit: 0, corr: [3]});
    }
    else {
      this.setState({ selectedOption: selectedOption }, () =>
        console.log(`Option selected:`, this.state.selectedOption)
      );
    }
  };
  //I know that it is so spaghettily I will fix this in someday
  ///////////////////////////////////////////////////////////////////////////////////////////
  kaary = (e: number, g?: boolean) => {
    let olddata2 = this.state.holdArray;
    if(e === 0 && g === false && this.state.checkInitial === true){
      olddata2.push(e);
      this.setState({checkInitial: false});
      console.log(`olddata2`+olddata2);
    }
    if (e !== 0) {
      olddata2.push(e);
      console.log(`olddata2`+olddata2);
    }
     if (g === true) {
      olddata2 = [];
      this.setState({holdArray: []}, () => {console.log(`hold` + this.state.holdArray);});
      console.log(`olddata2`+olddata2);
    }
  };

tyyy = () =>{

    this.state.connection.post(
      `/qbank`, {
        questions: 
          this.state.AnswerSet.map((value, index)=>({
                question: value.question,
                choices: value.choices,
                timeLimit: value.timeLimit,
                corr: value.corr,
          })),
      }      
    ) 
      .then((res) => {
        this.setState({thenText: res.data});
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }


  keep = () => {
    let olddata = this.state.AnswerSet;
      this.kaary(this.state.choices1check, false);
      this.kaary(this.state.choices2check);
      this.kaary(this.state.choices3check);
      this.kaary(this.state.choices4check);
      this.kaary(this.state.choices5check);
      this.kaary(this.state.choices6check);
      this.handleChangeForTime();
    if (this.state.type === "Multiple") {
      this.ChoicesRemoveEmpty(this.state.choices1);
      this.ChoicesRemoveEmpty(this.state.choices2);
      this.ChoicesRemoveEmpty(this.state.choices3);
      this.ChoicesRemoveEmpty(this.state.choices4);
      this.ChoicesRemoveEmpty(this.state.choices5);
      this.ChoicesRemoveEmpty(this.state.choices6);
      olddata.push({
        question: this.state.question,
        type: this.state.type,
        choices: this.state.stayArray,
        timeLimit: this.state.mins * 60 + this.state.secs,
        corr: this.state.holdArray,
      });
    }
    else if (this.state.type === "True/False") {
      olddata.push({
        question: this.state.question,
        type: this.state.type,
        choices: ["True", "False"],
        timeLimit: this.state.mins * 60 + this.state.secs,
        corr: this.state.holdArray,
      });
    }
        this.setState({
          choices1check: 0,
          choices2check: 0,
          choices3check: 0, 
          choices4check: 0, 
          choices5check: 0, 
          choices6check: 0,
          checkInitial: false,   
        }, ()=>{
          console.log(this.state.choices1check + this.state.choices2check + this.state.choices3check + this.state.choices4check + this.state.choices5check + this.state.choices6check);
        });
        this.kaary(0, true);
        this.ChoicesRemoveEmpty("", true);
        this.setState({currentQuestionIdx: this.state.currentQuestionIdx + 1, newQuestionIdx: this.state.newQuestionIdx + 1});
        console.log(this.state.mins);
        console.log(this.state.secs);
        console.log(this.state.AnswerSet);
  };

  Edit = () =>{
      this.kaary(this.state.choices1check);
      this.kaary(this.state.choices2check);
      this.kaary(this.state.choices3check);
      this.kaary(this.state.choices4check);
      this.kaary(this.state.choices5check);
      this.kaary(this.state.choices6check);
      this.handleChangeForTime();
    this.setState(state => {
      state.AnswerSet[this.state.currentQuestionIdx] = {
        question: this.state.question,
        type: this.state.type,
        choices: [
          this.state.choices1,
          this.state.choices2,
          this.state.choices3,
          this.state.choices4,
          this.state.choices5,
          this.state.choices6,
        ],
        timeLimit: this.state.mins * 60 + this.state.secs,
        corr: this.state.holdArray,
      };
    });
        console.log(this.state.AnswerSet);
  }

  handlesss = (e: number) => {
    switch (e) {
      case 0:
        if (this.state.choices1check !== e) {
          this.setState({ choices1check: e }, () => {
            console.log(this.state.choices1check);
          });
        } else {
          this.setState({ choices1check: 0 }, () => {
            console.log(this.state.choices1check);
          });
        }
        break;
      case 1:
        if (this.state.choices2check !== e) {
          this.setState({ choices2check: e }, () => {
            console.log(this.state.choices2check);
          });
        } else {
          this.setState({ choices2check: 0 }, () => {
            console.log(this.state.choices2check);
          });
        }
        break;
      case 2:
        if (this.state.choices3check !== e) {
          this.setState({ choices3check: e }, () => {
            console.log(this.state.choices3check);
          });
        } else {
          this.setState({ choices3check: 0 }, () => {
            console.log(this.state.choices3check);
          });
        }
        break;
      case 3:
        if (this.state.choices4check !== e) {
          this.setState({ choices4check: e }, () => {
            console.log(this.state.choices4check);
          });
        } else {
          this.setState({ choices4check: 0 }, () => {
            console.log(this.state.choices4check);
          });
        }
        break;
      case 4:
        if (this.state.choices5check !== e) {
          this.setState({ choices5check: e }, () => {
            console.log(this.state.choices5check);
          });
        } else {
          this.setState({ choices5check: 0 }, () => {
            console.log(this.state.choices5check);
          });
        }
        break;
      case 5:
        if (this.state.choices6check !== e) {
          this.setState({ choices6check: e }, () => {
            console.log(this.state.choices6check);
          });
        } else {
          this.setState({ choices6check: 0 }, () => {
            console.log(this.state.choices6check);
          });
        }
        break;
    }
  };

  handleChangeForReal = (selectedOption: { label: string, value: string } | null) => {
    this.setState({ selectedOption: selectedOption!, type: selectedOption!.value }, () => {
      console.log(`Option selected:`, this.state.selectedOption);
      console.log(this.state.type);
    });
  }

  // handleChangeForReal = (selectedOption: (value: {
  //   label: string,
  //   value: string
  // } | null) => void) => {
  //   this.setState({ selectedOption, type: selectedOption.value 
  //     }, () =>{
  //     console.log(`Option selected:`, this.state.selectedOption);
  //     console.log(this.state.type);
  //   }
  //   );
  // };

  handleChangeForTime = () => {
    this.setState({ totalTime: this.state.mins }, () => { console.log(this.state.totalTime);});
  }

  ChoicesRemoveEmpty = (e: string, g?: boolean) => {
    let olddata3 = this.state.stayArray;
    if(e !== ""){
      olddata3.push(e);
    }
    if(g === true){
      olddata3 = [];
      this.setState({stayArray: []});
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////


  componentWillUnmount() {
    this.state.resizeObserver.disconnect();
  }

  render() {
    const { accountInfo, location, history, match, ...rest } = this.props;
    let renderTarget: JSX.Element;
    let renderSlider: JSX.Element;
    switch (this.state.selectedOption.label) {
      case "Multiple Choices":
        renderTarget = (
          <>
            <div id={styles["answer-1"]} className={styles["answer"]}>
              <input ref={this.state.mcRefs[0].text} placeholder="Add Answer..." type="text" className={styles["answerbox"]}
                onChange={(e: any) => {
                  this.setState({ choices1: e.target.value });
                }} />
              <br />
              <input ref={this.state.mcRefs[0].checkbox} type="checkbox" className={styles["answercheck"]}
                onChange={() => {this.handlesss(0); this.setState({checkInitial:true});}} />
            </div>

            <div id={styles["answer-2"]} className={styles["answer"]}>
              <input ref={this.state.mcRefs[1].text} placeholder="Add Answer..." type="text" className={styles["answerbox"]}
                onChange={(e: any) => {
                  this.setState({ choices2: e.target.value });
                }} />
              <br />
              <input ref={this.state.mcRefs[1].checkbox} type="checkbox" className={styles["answercheck"]}
                onChange={() => this.handlesss(1)} />
            </div>

            <div id={styles["answer-3"]} className={styles["answer"]}>
              <input ref={this.state.mcRefs[2].text} placeholder="Add Answer..." type="text" className={styles["answerbox"]}
                onChange={(e: any) => {
                  this.setState({ choices3: e.target.value });
                }} />
              <br />
              <input ref={this.state.mcRefs[2].checkbox} type="checkbox" className={styles["answercheck"]}
                onChange={() => this.handlesss(2)} />
            </div>

            <div id={styles["answer-4"]} className={styles["answer"]}>
              <input ref={this.state.mcRefs[3].text} placeholder="Add Answer..." type="text" className={styles["answerbox"]}
                onChange={(e: any) => {
                  this.setState({ choices4: e.target.value });
                }} />
              <br />
              <input ref={this.state.mcRefs[3].checkbox} type="checkbox" className={styles["answercheck"]}
                onChange={() => this.handlesss(3)} />
            </div>

            <div id={styles["answer-5"]} className={styles["answer"]}>
              <input ref={this.state.mcRefs[4].text} placeholder="Add Answer..." type="text" className={styles["answerbox"]}
                onChange={(e: any) => {
                  this.setState({ choices5: e.target.value });
                }} />
              <br />
              <input ref={this.state.mcRefs[4].checkbox} type="checkbox" className={styles["answercheck"]}
                onChange={() => this.handlesss(4)} />
            </div>

            <div id={styles["answer-6"]} className={styles["answer"]}>
              <input ref={this.state.mcRefs[5].text} placeholder="Add Answer..." type="text" className={styles["answerbox"]}
                onChange={(e: any) => {
                  this.setState({ choices6: e.target.value });
                }} />
              <br />
              <input ref={this.state.mcRefs[5].checkbox} type="checkbox" className={styles["answercheck"]}
                onChange={() => this.handlesss(5)} />
            </div>
          </>
        );
        break;

      case "True or False":
        renderTarget = (
          <>
            <div id={styles["truebutton"]}>
              <p className={styles.true}>True
                <input ref={this.state.tfRefs[0]} type="checkbox" 
                  className={styles["tfcheck"]}
                  // onChange={() => this.state.TFAnswer !== true ? this.setState({ TFAnswer: true }) : this.setState({ TFAnswer: false })} />
                  onChange={e => {
                    this.state.tfRefs[1].current!.checked = !e;
                    this.setState({TFAnswer: [true, false]});
                    e.target.checked === true ? 
                    this.handlesss(0) : console.log("None");
                    e.target.checked === true ?
                    this.setState({checkInitial: true}) : console.log("Nonr Change");
                    //this.setState({choices1check: 1}, ()=>{console.log(this.state.choices1check);}) : this.setState({choices1check: 0}, ()=>{console.log(this.state.choices1check);});
                    //e.target.checked === true ? this.setState({TFAnswer: true}) : this.setState({TFAnswer: false});
                  }} />
              </p>
            </div>
            <div id={styles["falsebutton"]}>
              <p className={styles.false}>False
                <input ref={this.state.tfRefs[1]} type="checkbox" className={styles["tfcheck"]}
                  onChange={e => {
                    this.state.tfRefs[0].current!.checked = !e;
                    this.setState({TFAnswer: [false, true]});
                    e.target.checked === true ? 
                    this.handlesss(1) : console.log("None");
                    //this.setState({choices2check: 1}, ()=>{console.log(this.state.choices2check);}) : this.setState({choices2check: 0}, ()=>{console.log(this.state.choices2check);});
                    //e.target.checked === true ? this.setState({TFAnswer: true}) : this.setState({TFAnswer: false});
                   }}/>
              </p>
            </div>
          </>);
        break;

      default:
        renderTarget = (<p>Hellp</p>);
        break;
    }

    return (
      <div {...rest}>
        <div id={styles["profile-container"]} className="fill-parent">
          <div>
            <Logo
              elementRefUpdate={element => this.state.resizeObserver.observe(element)}
              id={styles.logo}
              role={this.props.accountInfo.role ?? "teacher"}
              primaryColor="#424242"
              secondaryColor="#424242"
            />
            <>
              {location.pathname.includes("/edit_game/mc") ? (
                <>
                  <div style={{height: "100vh", display:"flex", justifyContent:"center", alignItems: "flex-start", overflow:"auto", overflowY: "auto", overflowX: "hidden", flexFlow: "row wrap", alignContent:"flex-start"}}>
                    {this.state.AnswerSet.map((_, idx) =>(
                      <div 
                        style={{alignSelf:"flex-start"}}
                        className={idx <= 8 && this.state.currentQuestionIdx === idx ? styles["slider-bank-question-single-clicked"] : idx <= 8 ? styles["slider-bank-question-single"] : this.state.currentQuestionIdx === idx || this.state.AnswerSet.length === 0 ? styles["slide-bar-question-clicked"] : styles["slide-bar-question"]}
                        onClick={() => this.setState({ currentQuestionIdx: idx, temoCase: false})}
                      >
                        Question {idx + 1} 
                      </div>
                    ))}
                    <div
                      className={this.state.temoCase === true || this.state.newQuestionIdx === this.state.currentQuestionIdx ? styles["slider-bank-question-single-clicked"] : styles["slider-bank-question-single"]}
                      onClick={() => {
                        this.state.questionEditRef.current?.deactivateAll();
                        this.setState({temoCase: true, currentQuestionIdx: this.state.newQuestionIdx});
                        }}>
                          {"Question" + (this.state.newQuestionIdx + 1)}
                    </div>
                  </div>
                  <Link to="/profile">
                  <button 
                    id={styles["Finish-edit"]}
                    onClick={this.tyyy}
                  >
                    Finish Edit
                  </button>
                  </Link>
                  {/* <button style={{marginTop: "6%"}} onClick={this.tyyy}>Hi</button> */}
                </>
                  ) :
                <>
                  <Link to={"/teacher"} className={location.pathname === "/teacher" ? styles.selected : undefined}>Home</Link>
                  {["Edit_Game", "Student", "Set_Awards", "Settings"].map(i =>
                    <Link
                      key={i}
                      to={`/teacher/${i.toLowerCase()}`}
                      className={location.pathname.includes(i.toLowerCase()) ? styles.selected : undefined}
                    >
                      {i.replace("_", " ")}
                    </Link>
                  )}
                  
                </>
              }
            </>
          </div>
          <div>
            <div id={styles["top-bar"]} style={{ height: `calc(4rem + ${this.state.targetTopBarHeight}px)` }}>
              <span>
                <img className={styles.avatar} alt="profile" />
                {this.props.accountInfo.name}
              </span>
            </div>
            <Route exact path="/teacher">
              <div id={styles.thome}>
                <div id={styles.tevent}>
                  <h2>Boss Fight</h2>
                <Link to={"/play"}>
                  <button style={{backgroundColor: "#a70cff"}}>Start</button>
                </Link>
                </div>

                <div id={styles.tawards}>

                </div>
                <div id={styles.tunknown}>

                </div>
                <div id={styles.tsocial}>

                </div>
                <div id={styles.tmatchmaking}>
                  <Link to="/play">
                    Matching
                  </Link>
                </div>
              </div>
            </Route>
            <Route exact path="/teacher/edit_game">
              <div id={styles.edit}>
                <div className={styles.button}>
                  <Link to="/teacher/edit_game/Information">
                    <button className={styles.button2}>Add Game</button>
                  </Link>
                </div>
                <div className={styles["flex-container"]}>
                  <div id={styles.whitebar}>

                    <div id={styles.name}>Name</div>

                    <div id={styles.type}>  Type</div>

                    <div id={styles.teacher}>Teacher </div>


                  </div>
                  <div id={styles.bluesheet}>
                    {this.state.dataSet.map(
                      (value, index) => {
                        return (
                          <div key={index} className={styles.yellowbar}>
                            <div key={index} className={styles.game10}>{value.name}</div>
                            <div key={index} className={styles.boss}>{value.type}</div>
                            <div key={index} className={styles.teachname}>{value.teacher}</div>
                            <img key={index} src={threeline} className={styles.threeline}></img>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </Route>
            <Route exact path="/teacher/edit_game/information">
              <Quest />
            </Route>
            <Route exact path="/teacher/edit_game/bosssetting">
              <div id={styles["bossbackground-wrapper"]}>
                <p id={styles["selectboss"]}>
                  Select Boss
                  
                  <Swiper
                    navigation={true}
                    className="mySwiper"
                    onSlideChange={(swiper) => {
                      this.setState( { currentSwiperIdx: swiper.activeIndex }, ()=>{
                        console.log(this.state.currentSwiperIdx);
                      });
                    }}>
                      <SwiperSlide>
                      <img src={Monster} key={0}/>
                      </SwiperSlide>
                      <SwiperSlide >
                      <img src={Frong} key={1}/>
                      </SwiperSlide>
                      <SwiperSlide >
                      <img src={Mushroom} key={2}/>
                      </SwiperSlide>
                      <SwiperSlide key={3}>
                      <img src={Dragon}/>
                      </SwiperSlide>
                      <SwiperSlide key={4}>
                      <img src={Robo}/>
                      </SwiperSlide>
                      <SwiperSlide key={5}>
                      <img src={SeaMon}/>
                      </SwiperSlide>
                    </Swiper>
                </p>
                <div id={styles["boss-button-wrapper"]}>
                <Link to="/teacher/edit_game/mc" >
                <button id={styles["boss-button"]}>Edit Question</button>
              </Link>
                </div>
                <p id={styles["point"]}>
                  Total Score
                  <input id={styles.number1} type="number" name="fname" defaultValue={0}/>
                </p>
                <p id={styles["pass"]}>
                  Pass Rate
                  <input id={styles.number2} type="number" name="fname" defaultValue={10} min={10} max={100}/>
                </p>
                <div id={styles["witch"]}>
                  <p id={styles["witch-word"]}>{
                    this.state.currentSwiperIdx === 0 ? "Insect Queen" : 
                    this.state.currentSwiperIdx === 1 ? "The hungry Frog" : 
                    this.state.currentSwiperIdx === 2 ? "The Mushroom Solider" :
                    this.state.currentSwiperIdx === 3 ? "Red Dragon" :
                    this.state.currentSwiperIdx === 4 ? "BR-141" :
                    this.state.currentSwiperIdx === 5 ? "Sea Monster" :
                    ""
                    }</p>
                  <p id={styles["witch-info"]}>{
                    this.state.currentSwiperIdx === 0 ? "Insect from an unknown planet" : 
                    this.state.currentSwiperIdx === 1 ? "A carnivorous frog is hungry now" : 
                    this.state.currentSwiperIdx === 2 ? "A solider from an evil kingdom" :
                    this.state.currentSwiperIdx === 3 ? "A dragon from the fire realm" :
                    this.state.currentSwiperIdx === 4 ? "A robot powered by unknown technology":
                    this.state.currentSwiperIdx === 5 ? "A monster from the deep sea" :
                    ""
                    }</p>
                </div>
              </div>
            </Route>

            <Route exact path="/teacher/edit_game/mc">
              <QuestionEdit
                ref={this.state.questionEditRef}
                currentQuestion={this.state.AnswerSet[this.state.currentQuestionIdx]}
                minsValuePass={value => this.setState({ mins: value }, () => console.log(this.state.mins))}
                secsValuePass={value => this.setState({ secs: value }, () => console.log(this.state.secs))}
                scoreValuePass={value => this.setState({ scores: value })}
                onSelectionChange={e => this.handleChangeForReal(e)}
                data={this.data}
                questionRefPass={value => this.setState({ declare: value }, ()=> {console.log(this.state.declare)})}
                keep={this.keep}
                onQuestionInputChange={e => this.setState({ question: e.target.value })}
                renderTarget={renderTarget}
                mcRefs={this.state.mcRefs}
                tfRefs={this.state.tfRefs}
              />
            </Route>
            <Route path="/teacher/Student">
              <span>Student</span>
              {/* <Link to="/teacher/edit_game/mc" >
                <button>Go</button>
              </Link>
              <Link to="/teacher/edit_game/tf" >
                <button>ahead</button>
              </Link> */}
              <div id={styles["save-wrapper"]}>
                <p id={styles["save-text"]}> 
                <p>2{this.state.thenText}</p>
                <Link to="/profile">
                <button id={styles["save-button"]}>
                Return to main page</button>
                </Link>
                </p>
              </div>
            </Route>
            <Route path="/teacher/Set Awards">
              {/* <span>Set Awards</span> */}
              <div id={styles["save-wrapper"]}>
                <p id={styles["save-text"]}> 
                <p>2{this.state.thenText}</p>
                <button>Return to main page</button>
                </p>
              </div>
            </Route>
            <Route path="/teacher/Settings">
              <span>Settings</span>
            </Route>
            <Route exact path="/teacher/edit_game/save">
              <div>
                <p>2{this.state.thenText}</p>
                <button>Return to main page</button>
              </div>
            </Route>
          </div>
        </div>
      </div >
    );
  }
}

export default Misstea;