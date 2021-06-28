import React from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import "../CSS/StudentLogin/SLogin.scss";
import Logo from "../CSS/StudentLogin/StudentLogo.svg";
import Backg from "../CSS/StudentLogin/Web_1920_66.svg";

const api = new axios.create({ baseURL: "http://localhost:5000/" });

class SLogin extends React.Component {
  componentDidMount() {
    document.body.id = "student";
  }

  constructor(props) {
    super(props);
    this.state = {
      acc: "",
      pw: "",
      res: {},
    };

    this.handleChange = this.handleChange.bind(this);
    this.SaveLogin = this.SaveLogin.bind(this);
    this.handlelogin = this.handlelogin.bind(this);
  }

  handlelogin(obj) {
    // console.log(obj);
    this.setState({ res: obj });
    // console.log(this.state.res)
    let ret = this.state.res.reason;
    if (ret === "failed") {
      alert("login failed");
    } else if (ret === "success") {
      alert("login successs");
    } else {
      alert("unknown error");
    }
  }

  handleChange(event) {
    // console.log(event.target.name);
    let tname = event.target.name;
    if (tname === "user") {
      this.setState({ acc: event.target.value });
    }
    if (tname === "password") {
      this.setState({ pw: event.target.value });
    }
  }

  SaveLogin(event) {
    event.preventDefault();
    console.log(this.state);
    api
      .post("/login/" + this.state.acc + "/" + this.state.pw, {
        JSON: JSON.stringify(),
      })
      .then((response) => {
        console.log(response.status);
        // this.setState({ res: response.data });
        this.handlelogin(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="student_login_background_wrapper">
        <form className="student_login_from_wrapper">
          <div className="student_login_form_wrapper">
            <div className="student_login_topic_wrapper">
              <div className="student_login_topic_box">
                <h1 className="student_login_topic_text">
                  <img
                    className="student_login_image_logo"
                    src={Logo}
                    alt="go"
                    width="55px"
                    height="55px"
                  />
                  Student Login
                </h1>
              </div>
            </div>
            <div className="student_login_box_wrapper">
              <div className="student_login_account_wrapper">
                <input
                  className="student_login_account_input"
                  name="user"
                  type="text"
                  placeholder="Pin"
                  onChange={this.handleChange}
                  maxLength="6"
                  required
                />
              </div>
              <div className="student_login_password_wrapper">
                <input
                  className="student_login_password_input"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className="student_login_submit_wrapper">
                <button
                  className="student_login_button"
                  onClick={this.SaveLogin}
                >
                  Login
                </button>
              </div>
              <div className="student_login_text_wrapper">
                <div className="student_login_text_forget">
                  <NavLink className="student_login_text_forget_link" to="/">
                    <b>Forgot the password</b>
                  </NavLink>
                  <span className="student_login_text_register_wrapper">
                    <NavLink
                      className="student_login_text_register_link"
                      to="/register"
                    >
                      <b>Register</b>
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

export default SLogin;
