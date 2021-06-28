import React from "react";
import * as Device from "react-device-detect";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { imagesWithAltText } from "./assets/images/test";
import Lobby from "./desktop/lobby/lobby";
import Login from "./desktop/login/login";
import Options from "./desktop/Options/options";
import Profile from "./desktop/profile/profile";
import Misstea from "./desktop/teacher/teacher";
import Register from "./desktop/register/register";
import "./index.scss";
import MLogin from "./mobile/login/login";
import { AccountInfo } from "./modules/account-info";
import AnsweringModule from "./desktop/AnsweringMC/answeringModule";
import AnsweringTF from "../src/desktop/AnsweringTF/answering_TrueOrFalse";
import NakoAPI, {
  GameInfo,
  QuestionEndRequest,
  AccountRole,
} from "./modules/websocket-messages";
import Game from "./desktop/game/game";
import Back from "./desktop/AnsweringMC/BackgroundMusic.mp3";
import Bluebr from "./desktop/teacher/blueweb";
import Questsetting from "./desktop/teacher/questsetbar";

if (Device.isBrowser) {
  import("./font-desktop.scss");
} else {
  import("./font-mobile.scss");
}

interface AppState {
  inGame: boolean;
  accountInfo?: AccountInfo;
  gameInfo?: GameInfo<AccountRole>;
  questionEndRequest?: QuestionEndRequest | undefined;
}

class App extends React.Component<{}, AppState> {
  connection = new NakoAPI("ws://localhost:1880/ws");

  constructor(props: {}) {
    super(props);

    this.state = {
      inGame: false,
    };

    this.connection.on("messageSent", (data) => console.log("Sent: ", data));
    this.connection.on("messageReceived", (data) =>
      console.log("Received: ", data)
    );
    this.connection.on("close", (e) => console.log(e));
    this.connection.on("error", (e) => console.log(e));
  }

  componentWillUnmount() {
    this.connection.close();
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            {/* <Link to="/options">
              <p>Options</p>
            </Link> */}
            <Link to="/play">
              <p>Play</p>
            </Link>
            <Link to="/login">
              <p>Login</p>
            </Link>
            <Link to="/teacher">
              <p>Teacher</p>
            </Link>
            <Link to="/register">
              <p>Register</p>
            </Link>
            <Link to="/blueweb">
              <p>Blueweb</p>
            </Link>
            <Link to="/bosssetting">
              <p>questset</p>
            </Link>
            <Link
              to={{
                pathname: "/answeringmc",
              }}
            >
              <Link to="/bar">
                <p>bar</p>
              </Link>
              <p>Mutiple Chioces</p>
            </Link>
            <Link
              to={{
                pathname: "/answeringtf",
              }}
            >
              <p>Mutiple Chioces</p>
            </Link>
            <button
              id={
                this.state.accountInfo?.role === "student" ? "SetStudent" : ""
              }
              onClick={() =>
                this.setState({
                  accountInfo: { name: "DebugStudent", role: "student" },
                })
              }
            >
              Set student
            </button>
            <button
              id={
                this.state.accountInfo?.role === "teacher" ? "SetTeacher" : ""
              }
              onClick={() =>
                this.setState({
                  accountInfo: { name: "DebugTeacher", role: "teacher" },
                })
              }
            >
              Set teacher
            </button>
          </Route>
          <Route path="/answeringmc">
            <AnsweringModule
              timeLimit={120}
              connection={this.connection}
              currentQuestionProps={0}
              questionInfo={{
                question: "2 x 2 = ?",
                //choices: ["mmmmmmmmmmmm", "mmmmmmmmmmmm"],
                timeLimit: 120,
                type: "multiple_choice",
              }}
            />
          </Route>
          <Route path="/answeringtf">
            <AnsweringTF
              timeLimit={120}
              connection={this.connection}
              currentQuestionProps={0}
              questionInfo={{
                question: "2 x 2 = ?",
                choices: ["mmmmmmmmmmmm", "mmmmmmmmmmmm"],
                timeLimit: 120,
                type: "multiple_choice",
              }}
            />
          </Route>
          <Route path="/options">
            <Options pictures={[imagesWithAltText, imagesWithAltText]} />
          </Route>
          <Route path="/play">
            {this.state.inGame ? (
              <Game
                className="fill-parent"
                connection={this.connection}
                // accountInfo={
                //   this.state.accountInfo ?? { name: "Debug", role: "teacher" }
                // }
                accountInfo={
                  this.state.accountInfo ?? { name: "Debug", role: "student" }
                }
                gameInfo={this.state.gameInfo!}
              />
            ) : (
              <Lobby
                className="lobby-component fill-parent"
                onEnteredLobby={() => {
                  const audio = new Audio(Back);
                  audio.play();
                  audio.volume = 0.5;
                  audio.loop = true;
                  console.log("standBy");
                }}
                connection={this.connection}
                // accountInfo={
                //   this.state.accountInfo ?? { name: "Debug", role: "teacher" }
                // }
                accountInfo={
                  this.state.accountInfo ?? { name: "Student", role: "student" }
                }
                onGameStart={(gameInfo) => {
                  this.setState({ inGame: true, gameInfo: gameInfo });
                }}
              />
            )}
          </Route>
          <Route path="/login">
            {this.state.accountInfo ? (
              this.state.accountInfo.role === "student" ? (
                <Redirect to="/profile" />
              ) : (
                <Redirect to="/teacher" />
              )
            ) : Device.isBrowser ? (
              <Login
                className="fill-parent"
                onLoggedIn={(accountInfo) =>
                  this.setState({ accountInfo: accountInfo })
                }
              />
            ) : (
              <MLogin className="m-login-component fill-parent" />
            )}
          </Route>
          <Route path="/register">
            <Register className="fill-parent"></Register>
          </Route>
          <Route path="/profile">
            {(i) =>
              this.state.accountInfo ? (
                <Profile
                  className="fill-parent"
                  accountInfo={this.state.accountInfo}
                  {...i}
                />
              ) : (
                <Redirect to="/login" />
              )
            }
            {/* {i => <Profile className="fill-parent" accountInfo={{ name: "Test", role: "student" }} {...i}/>} */}
          </Route>
          <Route path="/teacher">
            {(i) =>
              this.state.accountInfo ? (
                <Misstea
                  className="fill-parent"
                  accountInfo={this.state.accountInfo}
                  {...i}
                />
              ) : (
                <Redirect to="/login" />
              )
            }
            {/* {i => <Profile className="fill-parent" accountInfo={{ name: "Test", role: "student" }} {...i}/>} */}
          </Route>
          <Route path="/blueweb">
            {(i) =>
              this.state.accountInfo ? (
                <Bluebr
                  className="fill-parent"
                  accountInfo={this.state.accountInfo}
                  {...i}
                />
              ) : (
                <Redirect to="/login" />
              )
            }
          </Route>
          <Route path="/bosssetting">
            {(i) =>
              this.state.accountInfo ? (
                <Questsetting
                  className="fill-parent"
                  accountInfo={this.state.accountInfo}
                  {...i}
                />
              ) : (
                <Redirect to="/login" />
              )
            }
          </Route>
          <Redirect to="/login" />
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
