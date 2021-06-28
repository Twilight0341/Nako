import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "../RoundTimer/ReminderTimer.scss";

const renderTime = (props: { remainingTime: number; elapsedTime: number }) => {
  //when count down finish
  if (props.remainingTime === 0) {
    return <div className="timer"> Finish</div>;
  }
  //when counting down
  return (
    <div className="timer">
      <div className="text">You have</div>
      <span style={{ display: "flex" }}>
        <div className="value">
          {Math.floor(props.remainingTime / 60)} :{" "}
          {props.remainingTime % 60 <= 9
            ? "0" + (props.remainingTime % 60)
            : props.remainingTime % 60}
        </div>
      </span>
      <div className="text">second left</div>
    </div>
  );
};

interface DisplayTimerProps {
  time: number;
  timerSize: number;
}

const DisplayTimer = (
  props: DisplayTimerProps & React.HTMLAttributes<HTMLDivElement>
) => {
  const { time, timerSize, ...rest } = props;

  return (
    <div {...rest}>
      <CountdownCircleTimer
        // styles={{ display: "flex", TextAlign: "center" }}
        isPlaying
        size={timerSize}
        duration={time}
        colors={[
          ["#10EC00", 0.5],
          ["#FFA515", 0.3],
          ["#FA1B1B", 0],
        ]}
        trailColor={"#rgba(0,0,0,0)"}
        strokeWidth={30}
        rotation={"counterclockwise"}
        //Setting for the timer keep repeat
        onComplete={() => [false, 0]}
      >
        {/*The content in the timer*/}
        {renderTime}
      </CountdownCircleTimer>
    </div>
  );
};

DisplayTimer.defaultProps = { time: 10, timerSize: 400 };

export default DisplayTimer;
