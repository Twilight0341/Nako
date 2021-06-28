import React from "react";
import styles from "./monster.module.scss";
import { MONSTER_ANIM } from "./index";
import { clamp, delay } from "../../utils/utils";

interface MonsterState {
  anim: string;
  health: number;
}

export default class Monster extends React.Component<React.HTMLAttributes<HTMLDivElement>, MonsterState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      anim: MONSTER_ANIM.stay,
      health: 1
    };
  }

  /**
   * Positive number to increase health, negative number to decrease health.
   */
  async changeHealth(value: number) {
    this.setState({ health: clamp(this.state.health + value) });
    
    if (value < 0) {
      this.setState({ anim: MONSTER_ANIM.damaged });
      await delay(1000);
      this.setState({ anim: MONSTER_ANIM.stay });
    }
  }
  
  render() {
    console.log(this.props.className === undefined);
    return (
      <div {...this.props} className={styles.monster + (this.props.className ? ` ${this.props.className}` : "")}>
        <meter low={0.33} high={0.66} optimum={1} value={this.state.health}/>
        <div>
          <img src={this.state.anim} alt="monster"/>
        </div>
      </div>
    );
  }
}