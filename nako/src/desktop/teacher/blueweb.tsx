import React from "react";
import { Link, Route, RouteChildrenProps } from "react-router-dom";
import { AccountInfo } from "../../modules/account-info";
import Logo from "../../modules/logo/logo";
import styles from "./blueweb.module.scss";



interface ProfileProps {
  accountInfo: AccountInfo;
}

interface ProfileState {
  resizeObserver: ResizeObserver;
  targetTopBarHeight: number;
  
}

export class Bluebr extends React.Component<ProfileProps & React.HTMLAttributes<HTMLDivElement> & RouteChildrenProps, ProfileState> {
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
            <Link to={"/teacher"} className={location.pathname === "/teacher" ? styles.selected : undefined}>Boss Setting</Link>
            {["Question1", "Question2", "Question3", "Question4"].map(i =>
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
                  <h2>Boss Fight59595</h2>
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
            <Route path="/blueweb/Edit Game">
              <span>Edit Game</span>
            </Route>
            <Route path="/blueweb/Student">
              <span>Games</span>
            </Route>
            <Route path="/blueweb/Set Awards">
              <span>Set Awards</span>
            </Route>
            <Route path="/blueweb/Settings">
              <span>Settings</span>
            </Route>
          </div>
        </div>
      </div>
    );
  }
}

export default Bluebr;