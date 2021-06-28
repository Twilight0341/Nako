import React from "react";
import { Link, Route, RouteChildrenProps } from "react-router-dom";
import { AccountInfo } from "../../modules/account-info";
import Logo from "../../modules/logo/logo";
import styles from "./questsetbar.module.scss";
//import Bossset from "./bosssetting";



interface ProfileProps {
  accountInfo: AccountInfo;
}

interface ProfileState {
  resizeObserver: ResizeObserver;
  targetTopBarHeight: number;
}

export class Questsetting extends React.Component<ProfileProps & React.HTMLAttributes<HTMLDivElement> & RouteChildrenProps, ProfileState> {
  constructor(props: ProfileProps & React.HTMLAttributes<HTMLDivElement> & RouteChildrenProps) {
    super(props);

    this.state = {
      resizeObserver: new ResizeObserver(entries => {
        for (const i of entries) {
          this.setState({ targetTopBarHeight: i.target.clientHeight });
        }
      }),
      targetTopBarHeight: 0
    };
  }

  componentWillUnmount() {
    this.state.resizeObserver.disconnect();
  }

  render() {
    const { accountInfo, location, history, match, ...rest } = this.props;

    return (
      <div {...rest}>
        <div id={styles["profile-container"]} className="fill-parent">
          <div>
          <Logo elementRefUpdate={element => this.state.resizeObserver.observe(element)} id={styles.logo} role={this.props.accountInfo.role ?? "teacher"} primaryColor="#424242" secondaryColor="#424242" />
            <Link to={"/teacher"} className={location.pathname === "/teacher" ? styles.selected : undefined}>Home</Link>
            {["Boss game", "Question 1", "Explanation 1", "Question 2"].map(i =>
              <Link
                key={i}
                to={`/profile/${i.toLowerCase()}`}
                className={location.pathname.includes(i.toLowerCase()) ? styles.selected : undefined}
              >
                {i}
              </Link>
            )}
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
                  <button>Start</button>
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
            <Route path="/questsetbar/Boss game">
              <span>Boss game</span>
            </Route>
            <Route path="/questsetbar/Question 1">
              <span>Question 1</span>
            </Route>
            <Route path="/questsetbar/Explanation 1">
              <span>Explanation 1</span>
            </Route>
            <Route path="/questsetbar/Question 2">
              <span>Question 2</span>
            </Route>
          </div>
        </div>
      </div>
    );
  }
}

export default Questsetting;