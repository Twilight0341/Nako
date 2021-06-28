import React from "react";
import styles from "./logo.module.scss";

interface LogoProps {
  role: "student" | "teacher";
  primaryColor: string;
  secondaryColor: string;
  elementRefUpdate?: (e: HTMLDivElement) => void;
}

export class Logo extends React.Component<LogoProps & React.HTMLAttributes<HTMLDivElement>> {
  static defaultProps = {
    primaryColor: "white",
    secondaryColor: "#ffed00"
  }

  render() {
    const { role, primaryColor, secondaryColor, elementRefUpdate, ...rest } = this.props;
    return (
      <div ref={element => {if (element) this.props.elementRefUpdate?.(element);}} {...rest}>
        <svg id={styles.logo} viewBox="0 0 275 100" preserveAspectRatio="xMidYMid meet">
          <style>
            {`#title { font-size: 85px; dominant-baseline: hanging; fill: ${primaryColor} }`}
            {`#subtitle { font-size: 28px; float: right; fill: ${secondaryColor} }`}
          </style>
          <text x="0" y="0" id="title" className="text-shadow">Nako</text>
          <text x="100%" y="99%" id="subtitle" className="text-shadow" textAnchor="end">for {role}s</text>
        </svg>
      </div>
    );
  }
}

export default Logo;