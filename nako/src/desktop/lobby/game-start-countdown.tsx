import React from "react";

interface GameStartCountdownProps {
  duration: number;
  onCountdownEnd: () => void;
}

interface GameStartCountdownState {
  remainingTime: number;
}

export default class GameStartCountdown extends React.Component<GameStartCountdownProps, GameStartCountdownState> {
  static defaultProps = { duration: 5 };

  constructor(props: GameStartCountdownProps) {
    super(props);
    this.state = { remainingTime: Math.round(props.duration) };
  }

  componentDidMount() {
    const zero = new Date();
    zero.setSeconds(zero.getSeconds() + 5);

    const updateDelta = () => {
      this.setState({ remainingTime: Date.now() - zero.getTime() }, () => {
        this.state.remainingTime < 0 ? requestAnimationFrame(updateDelta) : this.props.onCountdownEnd();
      });
    };

    updateDelta();
  }

  render() {
    return (
      <>
        <h3>Be ready! Game is starting in:</h3>
        <h3>{(Math.ceil(Math.abs(this.state.remainingTime) / 1000)).toString()}</h3>
      </>
    );
  }
}