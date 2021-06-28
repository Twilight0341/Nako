import React from "react";
import style from "./ScoreSelector.module.scss";
import CSS from "csstype";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface Props {
  scoreValuePass: (value: number) => void;
}

interface States {
  scoreValue: number;
}
export default class ScoreSelector extends React.Component<Props, States> {
  componentDidMount() {
    //document.body.id = "app";
  }

  updateScoreValue = (e: any) => {
    if (this.state.scoreValue <= 100) {
      this.setState({ scoreValue: e.target.value });
    } else {
      this.setState({ scoreValue: 100 });
    }
    if (this.state.scoreValue < 0) {
      this.setState({ scoreValue: 0 });
    }
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      scoreValue: 0,
    };
  }

  TrackStyle: CSS.Properties = {
    backgroundColor: "#888888",
    height: "15px",
    boxShadow: "5px 5px 5px rgb(0, 0, 0, 0.45)",
  };

  railStyle: CSS.Properties = {
    backgroundColor: "#00F600",
    height: "15px",
  };

  handleStyle: CSS.Properties = {
    border: "solid 2px #888888",
    height: "31px",
    width: "31px",
    boxShadow: "5px 5px 5px rgba(0, 0, 0, 0.45)",
  };

  timeText: CSS.Properties = {
    width: "2vw",
    marginLeft: "5%",
    marginRight: "5%",
    fontSize: "3rem",
  };

  render() {
    return (
      <>
        <table cellPadding="5" id={style.table}>
          <tr className={style.listbox}>
            <td className={style.sliderBox}>
              <p className={style.tagText}>Score Weight</p>
            </td>
          </tr>
          <tr className={style.listbox}>
            <td id={style.inputBox}>
              <div>
                <input
                  className={style.input}
                  type="number"
                  value={this.state.scoreValue}
                  onChange={this.updateScoreValue}
                />
              </div>
            </td>
          </tr>
          <tr className={style.listbox}>
            <td className={style.sliderBox}>
              <Slider
                min={0}
                max={100}
                trackStyle={this.TrackStyle}
                railStyle={this.railStyle}
                handleStyle={this.handleStyle}
                value={this.state.scoreValue}
                onChange={(e: number) => {
                  this.setState({ scoreValue: e }, () => {
                    this.props.scoreValuePass(e);
                  });
                }}
              />
            </td>
          </tr>
        </table>
      </>
    );
  }
}
