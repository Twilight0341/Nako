import React from "react";
import { Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { animate, delay } from "../../utils/utils";
import styles from "./lobby.module.scss";
import NakoAPI, { AccountRole, GameInfo, LobbyInfo } from "../../modules/websocket-messages";
import Logo from "../../modules/logo/logo";
import GameStartCountdown from "./game-start-countdown";
import { AccountInfo } from "../../modules/account-info";

enum ProgressPhase {
  Name,
  LobbyID,
  Lobby,
  Starting,
  Ended
}

enum ErrorMessage {
  Generic = "An error occurred while your request was being processed.",
  TimedOut = "Your request was timed out. Please try again.",
  MissingLobby = "The provided lobby ID does not exist."
}

interface LobbyProps {
  connection: NakoAPI;
  accountInfo: AccountInfo;
  onGameStart: (gameInfo: GameInfo<AccountRole>) => void;
  onEnteredLobby?: () => void;
}

interface LobbyStates {
  name: string;
  lobbyIDInput: string;
  currentProgress: ProgressPhase;
  inputParams: React.InputHTMLAttributes<HTMLInputElement>[];
  inputRef: React.RefObject<HTMLInputElement>;
  inputTransitioning: boolean;
  error: {
    occurred: boolean;
    message: ErrorMessage;
  };
  transitionedToLobby: boolean;
  lobbyInfo?: LobbyInfo;
  gameInfo?: GameInfo<AccountRole>;
}

class Lobby extends React.Component<LobbyProps & React.HTMLAttributes<HTMLDivElement>, LobbyStates> {
  constructor(props: LobbyProps & React.HTMLAttributes<HTMLDivElement>) {
    super(props);

    this.state = {
      name: this.props.accountInfo.name,
      lobbyIDInput: "",
      currentProgress: this.props.accountInfo.role === "student" ? ProgressPhase.Name : ProgressPhase.LobbyID,
      inputParams: [{
        className: "box-shadow",
        type: "text",
        placeholder: "Enter name...",
        defaultValue: this.props.accountInfo.name,
        onChange: e => this.setState({ name: e.target.value })
      }, {
        className: "box-shadow hide-number-buttons",
        type: "number",
        placeholder: "Enter game ID",
        onChange: e => this.setState({ lobbyIDInput: e.target.value })
      }],
      inputRef: React.createRef<HTMLInputElement>(),
      inputTransitioning: false,
      error: {
        occurred: false,
        message: ErrorMessage.Generic
      },
      transitionedToLobby: false
    };

    this.props.connection.subscribe("req", "keep_alive", () => this.props.connection.send({
      method: "res",
      type: "keep_alive",
      payload: {
        name: this.state.name,
        lobbyID: this.state.lobbyInfo!.id
      }
    }));

    if (this.props.accountInfo.role === "teacher") {
      this.props.connection.send({
        method: "req",
        type: "lobby_create",
        payload: null
      }).then(payload => {
        this.props.connection.send({
          method: "req",
          type: "lobby_join",
          payload: {
            lobbyID: payload.lobbyID,
            accountInfo: this.props.accountInfo
          }
        }).then(payload => {
          if (payload.lobbyInfo) {
            this.setState({ lobbyInfo: payload.lobbyInfo });
          } else {
            console.error("Could not join lobby after lobby creation.");
          }
        });
      });
    }
  }

  lobbyNotFoundHandler(error: string) {
    console.log(error);
  }

  // For student`
  // eslint-disable-next-line camelcase
  async s_formSubmitHandler(e: React.FormEvent<HTMLFormElement>, ms?: number) {
    e.preventDefault();
    this.setState({ error: { ...this.state.error, occurred: false } });

    const triggerNextProgressPhase = () => {
      if (this.state.currentProgress < ProgressPhase.Ended) {
        this.setState({ currentProgress: this.state.currentProgress + 1 });
      }
    };

    const invalidAnimation = () => {
      animate("shake", this.state.inputRef.current!, 500);
    };

    const triggerDelay = async () => {
      if (ms) {
        this.setState({
          inputTransitioning: true
        });

        await delay(ms);

        this.setState({
          inputTransitioning: false
        });
      }
    };

    switch (this.state.currentProgress) {
      case ProgressPhase.Name:
        if (this.state.name !== "") {
          await triggerDelay();
          triggerNextProgressPhase();
        } else {
          invalidAnimation();
        }

        break;
      
      case ProgressPhase.LobbyID:
        if (this.state.lobbyIDInput !== "") {
          this.props.connection.send({
            method: "req",
            type: "lobby_join",
            payload: {
              lobbyID: Number(this.state.lobbyIDInput),
              accountInfo: {
                ...this.props.accountInfo,
                name: this.state.name
              }
            }
          }, 10000).then(async res => {
            if (res) {
              if (res.lobbyInfo) {
                this.setState({ lobbyInfo: res.lobbyInfo });
                this.props.onEnteredLobby?.();

                this.props.connection.subscribe("res", "lobby_update", msg => {
                  this.setState({ lobbyInfo: msg.lobbyInfo });
                });

                this.props.connection.subscribe("req", "game_start").then(msg => {
                  this.setState({ gameInfo: msg.gameInfo });

                  this.props.connection.send({
                    method: "res",
                    type: "game_start",
                    payload: null
                  });

                  triggerNextProgressPhase();
                });

                await triggerDelay();
                triggerNextProgressPhase();
              } else {
                this.setState({ error: { occurred: true, message: ErrorMessage.MissingLobby } });
                console.log(res.error);
              }
            } else {
              this.setState({ error: { occurred: true, message: ErrorMessage.TimedOut } });
            }
          }).catch(e => {
            console.log(e);
            this.setState({ error: { occurred: true, message: ErrorMessage.Generic } });
          });
        } else {
          invalidAnimation();
        }
        break;

      default:
        break;
    }
  }

  // For teacher
  // eslint-disable-next-line camelcase
  t_onEnterButtonHandler() {
    this.props.onEnteredLobby?.();

    this.setState({ currentProgress: ProgressPhase.Lobby });

    this.props.connection.subscribe("res", "lobby_update", payload => {
      this.setState({ lobbyInfo: payload.lobbyInfo });
    });

    this.props.connection.subscribe("req", "game_start").then(payload => {
      this.setState({ currentProgress: ProgressPhase.Starting, gameInfo: payload.gameInfo });

      this.props.connection.send({
        method: "res",
        type: "game_start",
        payload: null
      });
    });
  }

  // eslint-disable-next-line camelcase
  t_startGameButtonHandler() {
    this.props.connection.send({
      method: "req",
      type: "game_start",
      payload: {
        gameInfo: {
          role: "teacher",
          questions: [{
            question: "TypeScript is a(n) ________ of JavaScript.",
            choices: ["subset", "superset", "upperset", "inclusion"],
            timeLimit: 10,
            answer: 1,
            type: "multiple_choice"
          }, {
            question: "To get changes from a remote repository, the user needs to run:",
            choices: ["npm i", "git merge", "git commit", "git fetch"],
            timeLimit: 10,
            answer: 3,
            type: "multiple_choice"
          }]
        }
      }
    });
  }
  
  render() {
    const { connection, accountInfo, onGameStart, onEnteredLobby, ...rest } = this.props;

    return (
      <div {...rest}>
        <div className={styles["lobby-container"]}>
          <Link to="/profile">
            <button id={styles.back} className="box-shadow" >
              <span className={"arrow-left"}/>
              <span>Back</span>
            </button>
          </Link>
          {/* <button
            style={{position: "absolute", zIndex: 1, bottom: 0, right: 0}}
            onClick={() => this.setState({
              lobbyInfo: this.state.lobbyInfo ? undefined : {
                id: 0,
                players: [this.state.name, "Test1", "Test2", "Test3", "Test4", "Test5", "Test6", "Test7", "Test8", "Test9", "Test10", "Test11", "Test12"]
              },
              currentProgress: this.state.currentProgress === ProgressPhase.Lobby ? ProgressPhase.Name : ProgressPhase.Lobby
            })}
          >
            Test
          </button> */}
          <CSSTransition
            in={this.state.lobbyInfo !== undefined && this.state.currentProgress >= ProgressPhase.Lobby}
            timeout={500}
            classNames={{
              enter: styles["background-top-enter"],
              enterActive: styles["background-top-enter-active"],
              enterDone: styles["background-top-enter-done"],
              exit: styles["background-top-exit"],
              exitActive: styles["background-top-exit-active"],
              exitDone: styles["background-top-exit-done"]
            }}
          >
            <div id={this.state.transitionedToLobby ? styles.background : styles["background-top"]} className={this.props.accountInfo.role === "student" ? styles.student : styles.teacher}>
              <CSSTransition
                in={this.state.lobbyInfo === undefined || !(this.state.currentProgress >= ProgressPhase.Lobby)} timeout={500}
                classNames={{
                  enter: styles["title-container-enter"],
                  enterActive: styles["title-container-enter-active"],
                  enterDone: styles["title-container-enter-done"],
                  exit: styles["title-container-exit"],
                  exitActive: styles["title-container-exit-active"],
                  exitDone: styles["title-container-exit-done"]
                }}
                onExited={() => this.setState({ transitionedToLobby: true })}
                mountOnEnter unmountOnExit
              >
                <Logo id={styles["title-container"]} role={this.props.accountInfo.role}/>
              </CSSTransition>
              <CSSTransition
                in={this.state.transitionedToLobby && this.state.lobbyInfo !== undefined}
                timeout={500}
                classNames={{
                  enter: styles["lobby-info-container-enter"],
                  enterActive: styles["lobby-info-container-enter-active"],
                  enterDone: styles["lobby-info-container-enter-done"],
                  exit: styles["lobby-info-container-exit"],
                  exitActive: styles["lobby-info-container-exit-active"],
                  exitDone: styles["lobby-info-container-exit-done"]
                }}
                onExit={() => this.setState({ transitionedToLobby: false })}
                mountOnEnter unmountOnExit
              >
                <div id={styles["lobby-info-container"]}>
                  {this.state.currentProgress !== ProgressPhase.Starting ?
                    <>
                      <h3>{this.props.accountInfo.role === "teacher" ? "Students in lobby" : "You are playing with"}:</h3>
                      <div id={styles["player-list"]}>
                        {this.state.lobbyInfo !== undefined ? this.state.lobbyInfo!.players.map((player, i) => <p key={i}>{player}</p>) : null}
                      </div>
                      {this.props.accountInfo.role === "teacher" ? <button onClick={() => this.t_startGameButtonHandler()}>Let's begin!</button> : null}
                    </> :
                    <GameStartCountdown
                      onCountdownEnd={() => {
                        if (this.state.gameInfo) {
                          console.log("Game starting");
                          this.props.onGameStart(this.state.gameInfo);
                        } else {
                          throw new Error("Game start was triggered but game info was missing.");
                        }
                      }}
                    />
                  }
                </div>
              </CSSTransition>
            </div>
          </CSSTransition>
          <CSSTransition
            in={this.state.lobbyInfo === undefined || !(this.state.currentProgress >= ProgressPhase.Lobby)}
            timeout={500}
            classNames={{
              enter: styles["background-bottom-enter"],
              enterActive: styles["background-bottom-enter-active"],
              enterDone: styles["background-bottom-enter-done"],
              exit: styles["background-bottom-exit"],
              exitActive: styles["background-bottom-exit-active"],
              exitDone: styles["background-bottom-exit-done"]
            }}
            unmountOnExit
          >
           <div id={styles["background-bottom"]} className={`box-shadow-inner ${this.props.accountInfo.role === "student" ? styles.student : styles.teacher}`}>
              {this.props.accountInfo.role === "teacher" ?
                <div id={styles["input-container"]}>
                  {this.state.lobbyInfo ?
                    <>
                      <span>Your lobby is ready! ID: {this.state.lobbyInfo.id}</span>
                      <button id={styles.submit} className={`box-shadow ${styles.teacher}`} onClick={() => this.t_onEnterButtonHandler()}>Start</button>
                    </> :
                    <span>Creating your lobby...</span>
                  }
                </div> :
                <form id={styles["input-container"]} onSubmit={e => this.s_formSubmitHandler(e, this.state.currentProgress === ProgressPhase.Name ? 600 : 0)}>
                  <CSSTransition in={!this.state.inputTransitioning} timeout={500} classNames="fade-rtl">
                    <input
                      ref={this.state.inputRef}
                      id={styles.input}
                      {...this.state.inputParams[this.state.currentProgress]}
                    />
                  </CSSTransition>
                  {this.state.error.occurred ? <p className="error">{this.state.error.message}</p> : null}
                  <button id={styles.submit} className={`box-shadow ${styles.student}`} type="submit">Enter</button>
                </form>
              }
            </div>
          </CSSTransition>
        </div>
      </div>
    );
  }
}

export default Lobby;