import React from "react";
import "../CSS/NotFound/NotFound.scss";

class NotFound extends React.Component {
  componentDidMount() {
    document.body.id = "notfound";
  }

  render() {
    return <div />;
  }
}
export default NotFound;
