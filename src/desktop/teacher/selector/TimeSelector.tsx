import React from "react";
import style from "./TimeSelector.module.scss";
import CSS from "csstype";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { clamp } from "../../../utils/utils";


interface TimeSelectorProps {
  minsValuePass: (value: number) => void;
  secsValuePass: (value: number) => void;
}

interface TimeSelectorStates {
  minsValue: number;
  secsValue: number;
}
export default class TimeSelector extends React.Component<TimeSelectorProps, TimeSelectorStates> {
  componentDidMount() {
    //document.body.id = "app";
  }

  updateMinsValue = (e: React.ChangeEvent<HTMLInputElement>, min:number, max:number) => {
    this.setState({ minsValue: clamp(Number(e.target.value), min, max) }, ()=>this.props.minsValuePass(this.state.minsValue));
  }

  updateSecsValue = (e: React.ChangeEvent<HTMLInputElement>, min:number, max:number) => {
    this.setState({ secsValue: clamp(Number(e.target.value), min, max) }, ()=>this.props.secsValuePass(this.state.secsValue));
  };

  constructor(props: TimeSelectorProps) {
    super(props);
    this.state = {
      minsValue: 0,
      secsValue: 0,
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
    //boxShadow: "10px 10px 10px rgb(0, 0, 0, 0.45)",
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
              <p className={style.tagText}>Minutes</p>
              <Slider
                min={0}
                max={99}
                trackStyle={this.TrackStyle}
                railStyle={this.railStyle}
                handleStyle={this.handleStyle}
                value={this.state.minsValue}
                onChange={(e: number) => {
                  this.setState({ minsValue: e }, () => {
                    this.props.minsValuePass(e);
                  });
                }}
              />
            </td>
          </tr>
          <tr className={style.listBox}>
            <td className={style.sliderBox}>
              <p className={style.tagText}>Second</p>
              <Slider
                min={0}
                max={59}
                trackStyle={this.TrackStyle}
                railStyle={this.railStyle}
                handleStyle={this.handleStyle}
                value={this.state.secsValue}
                onChange={(e: number) => {
                  this.setState({ secsValue: e }, () => {
                    this.props.secsValuePass(e);
                  });
                }}
              />
            </td>
          </tr>
          <td id={style.inputBox}>
              <p className={style.tagText}>Time allowed</p>
              <div>
                <input
                  className={style.input}
                  type="number"
                  value={this.state.minsValue}
                  onChange={(e)=>this.updateMinsValue(e, 0, 99)}
                  max="2"
                />
                <span style={this.timeText}>:</span>
                <input
                  className={style.input}
                  type="number"
                  value={this.state.secsValue}
                  onChange={(e)=>this.updateSecsValue(e, 0, 59)}
                  max="2"
                />
              </div>
            </td>
        </table>
      </>
    );
  }
}
