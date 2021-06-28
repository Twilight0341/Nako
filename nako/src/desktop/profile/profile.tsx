import React from "react";
import { Link, Route, RouteChildrenProps } from "react-router-dom";
import { AccountInfo } from "../../modules/account-info";
import Logo from "../../modules/logo/logo";
import styles from "./profile.module.scss";

interface ProfileProps {
  accountInfo: AccountInfo;
}

interface ProfileState {
  resizeObserver: ResizeObserver;
  targetTopBarHeight: number;
}

export class Profile extends React.Component<ProfileProps & React.HTMLAttributes<HTMLDivElement> & RouteChildrenProps, ProfileState> {
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
            <Logo elementRefUpdate={element => this.state.resizeObserver.observe(element)} id={styles.logo} role={this.props.accountInfo.role ?? "student"} primaryColor="#424242" secondaryColor="#424242"/>
            <Link to={"/profile"} className={location.pathname === "/profile" ? styles.selected : undefined}>Home</Link>
            {["Scoreboard", "Games", "Awards", "Settings"].map(i =>
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
                <img className={styles.avatar} alt="profile"/>
                {this.props.accountInfo.name}
              </span>
            </div>
            <Route exact path="/profile">
              <div id={styles.home}>
                <div id={styles.event}>
                  <h2>Boss Fight</h2>
                  <Link to={"/play"}>
                    <button style={{ backgroundColor: "#a70cff"}}>Play</button>
                  </Link>
                </div>
                <div id={styles.awards}>

                </div>
                <div id={styles.unknown}>

                </div>
                <div id={styles.social}>

                </div>
                <div id={styles.matchmaking}>
                  <Link to="/play">
                    Matching
                  </Link>
                </div>
              </div>
            </Route>
            <Route path="/profile/scoreboard">
              <span>Scoreboard</span>
            </Route>
            <Route path="/profile/games">
              <span>Games</span>
            </Route>
            <Route path="/profile/awards">
              <span>Awards</span>
            </Route>
            <Route path="/profile/settings">
              <span>Settings</span>
            </Route>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;