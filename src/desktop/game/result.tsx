import React from "react";
import CSSTransition from "react-transition-group/CSSTransition";
import { GameEndRequest } from "../../modules/websocket-messages";
import { delay } from "../../utils/utils";
import styles from "./result.module.scss";

interface ResultProps {
  in: boolean;
  data?: GameEndRequest;
}

interface ResultState {
  resultScrollDiv: React.RefObject<HTMLDivElement>;
  sequentialDisplayCounter: number;
}

export default class Result extends React.Component<ResultProps, ResultState> {
  constructor(props: ResultProps) {
    super(props);

    this.state = {
      resultScrollDiv: React.createRef<HTMLDivElement>(),
      sequentialDisplayCounter: 0
    };

    if (this.props.in && this.props.data) {
      this.startSequentialDisplay(this.props.data.length, 200);
    }
  }

  componentDidUpdate(prevProps: ResultProps) {
    if (!prevProps.in && this.props.in) {
      if (this.props.data) {
        this.startSequentialDisplay(this.props.data.length, 200);
      } else {
        throw new Error("In was triggered but no result data was provided.");
      }
    }
  }

  async startSequentialDisplay(length: number, ms: number) {
    for (let i = 0; i <= length; i++) {
      this.setState({ sequentialDisplayCounter: i });
      await delay(ms);
    }
  }

  render() {
    return (
      <div id={styles.result} className="fill-parent">
        {this.props.data ?
          <section>
            <h1>Results</h1>
            <hr/>
            <div
              ref={this.state.resultScrollDiv}
              style={this.state.resultScrollDiv.current && this.state.resultScrollDiv.current.scrollHeight - this.state.resultScrollDiv.current.clientHeight ?
                { paddingRight: "15px" } : undefined
              }
            >
              <div>
                <div id={styles["rank-header"]} className="fill-parent"><span>Name</span><span>Score</span></div>
              </div>
              {this.props.data.slice(0, this.state.sequentialDisplayCounter).map((result, i) =>
                <div key={i}>
                  <CSSTransition
                    in={true} appear={true} exit={false} timeout={500}
                    classNames={{
                      appear: styles["slide-b2t-appear"],
                      appearActive: styles["slide-b2t-appear-active"],
                      appearDone: styles["slide-b2t-appear-done"]
                    }}
                  >
                    <div className="fill-parent"><span>{result.name}</span><span>{result.score}</span></div>
                  </CSSTransition>
                </div>
              )}
            </div>
          </section> :
          <h1 className="error">Failed to retrieve results.</h1>
        }
      </div>
    );
  }
}