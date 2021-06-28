import React from 'react';
import styles from "./options.module.scss";

interface OptionRowProps {
  pictureSrcs: (string | { img: string, alt: string })[];
}

interface OptionRowStates {
  currentSelection: number;
}

class OptionRow extends React.Component<OptionRowProps, OptionRowStates> {
  constructor(props: OptionRowProps) {
    super(props);

    this.state = { currentSelection: 0 };
  }

  incrementSelection() {
    this.setState({ currentSelection: Math.min(this.props.pictureSrcs.length - 1, this.state.currentSelection + 1) });
  }

  decrementSelection() {
    this.setState({ currentSelection: Math.max(0, this.state.currentSelection - 1) });
  }

  render() {
    return (
      <div className={styles["option-row"]}>
        <button onClick={() => this.decrementSelection()}>{"<"}</button>
        {
          typeof this.props.pictureSrcs[this.state.currentSelection] === "string" ?
            <img src={this.props.pictureSrcs[this.state.currentSelection] as string} alt=""/> :
            <img src={(this.props.pictureSrcs[this.state.currentSelection] as { img: string, alt: string }).img} alt={(this.props.pictureSrcs[this.state.currentSelection] as { img: string, alt: string }).alt}/>
        }
        <button onClick={() => this.incrementSelection()}>{">"}</button>
      </div>
    );
  }
}

interface OptionsProps {
  pictures: (string[] | { img: string, alt: string }[])[];
}

export class Options extends React.Component<OptionsProps> {
  render() {
    return (
      <div>
        {this.props.pictures.map((obj, i) => <OptionRow pictureSrcs={obj} key={i}/>)}
      </div>
    );
  }
}

export default Options;