import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import "../CSS/Register/Register.scss";
import Logo from "../CSS/Register/RegisterLogo.svg";

const api = new axios.create({ baseURL: "http://localhost:5000/" });

class Register extends React.Component {
  componentDidMount() {
    document.body.id = "register";
  }

  constructor(props) {
    super(props);
    this.state = {
      pin: "",
      email: "",
      pw: "",
      con: "",
      res: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.SaveLogin = this.SaveLogin.bind(this);
  }

  handleChange(event) {
    // console.log(event.target.name);
    let tname = event.target.name;
    if (tname === "pin") {
      this.setState({ pin: event.target.value });
    }
    if (tname === "email") {
      this.setState({ email: event.target.value });
    }
    if (tname === "password") {
      this.setState({ pw: event.target.value });
    }
    if (tname === "confirm") {
      this.setState({ con: event.target.value });
    }
  }

  SaveLogin(event) {
    event.preventDefault(event);
    console.log(this.state);
    api
      .post(
        "/register/" +
          this.state.pin +
          "/" +
          this.state.email +
          "/" +
          this.state.pw +
          "/" +
          this.state.com
      )
      .then((response) => {
        console.log("res :" + response);
        this.setState({ res: response.data });
      });

    console.log(this.state.res);
  }

  render() {
    return (
      <div className="register_background_wrapper">
        <form className="register_from_wrapper">
          <div className="register_form_wrapper">
            <div className="register_topic_wrapper">
              <div className="register_topic_box">
                <h1 className="register_topic_text">
                  <img
                    className="register_image_logo"
                    src={Logo}
                    alt="go"
                    width="55px"
                    height="55px"
                  />
                  Sign Up
                </h1>
              </div>
            </div>
            <div className="register_box_wrapper">
              <div className="register_account_wrapper">
                <input
                  className="register_account_input"
                  name="pin"
                  type="text"
                  placeholder="Pin"
                  onChange={this.handleChange}
                  maxLength="6"
                  required
                />
              </div>
              <div className="register_email_wrapper">
                <input
                  className="register_email_input"
                  name="email"
                  type="email"
                  placeholder="Email"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="register_password_wrapper">
                <input
                  className="register_password_input"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="register_password_wrapper">
                <input
                  className="register_password_input"
                  name="confirm"
                  type="password"
                  placeholder="Confirm Password"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="register_submit_wrapper">
                <button className="register_button" onClick={this.SaveLogin}>
                  Confirm
                </button>
              </div>
              <div className="register_text_wrapper">
                <div className="register_text_forget">
                  <NavLink className="register_text_forget_link" to="/slogin">
                    <b>Student Login</b>
                  </NavLink>
                  <span className="register_text_register_wrapper">
                    <NavLink
                      className="register_text_register_link"
                      to="/tlogin"
                    >
                      <b>Teacher Login</b>
                    </NavLink>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default Register;
