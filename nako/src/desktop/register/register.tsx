import React from "react";
import { Link } from "react-router-dom";
import styles from "./register.module.scss";

export class Register extends React.Component<React.HTMLAttributes<HTMLDivElement>> {
  render() {
    const { ...rest } = this.props;
    return (
      <div {...rest}>
        <div id={styles.background} className="fill-parent">
          <section>
            <div id={styles.title}>
              <h3 id={styles["title-text"]}>
                <img alt="Register icon"/>
                Register
              </h3>
            </div>
            <div id={styles.content}>
              <form>
                <input placeholder="Email" type="email" autoComplete="new-email"/>
                <input placeholder="Username" autoComplete="new-username"/>
                <input placeholder="Password" type="password" autoComplete="new-password"/>
                <input placeholder="Confirm password" type="password" autoComplete="confirm-new-password"/>
                <button id={styles.submit} className="box-shadow" type="submit">Confirm</button>
              </form>
              <div id={styles.container}>
                <Link to="/login">
                  <span>Already have an account? Login here.</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default Register;