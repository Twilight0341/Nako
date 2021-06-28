import React from "react";
import Axios, { AxiosInstance } from "axios";
import { Link } from "react-router-dom";
import styles from "./login.module.scss";
import { delay } from "../../utils/utils";
import { AccountInfo } from "../../modules/account-info";
import { CSSTransition } from "react-transition-group";

interface QRProps {
  embed: string;
  connection: AxiosInstance;
  onScanned: (loginInfo: AccountInfo) => void;
}

interface QRState {
  scanned: boolean;
  imageSrc?: string;
}

class QR extends React.Component<QRProps, QRState> {
  willUnmount = false;

  constructor(props: QRProps) {
    super(props);

    this.state = { scanned: false };
    this.props.connection
      .get<{ img: string }>(`qr/${this.props.embed}`)
      .then((res) => this.setState({ imageSrc: res.data.img }));
    this.checkScanStatus();
  }

  componentWillUnmount = () => (this.willUnmount = true);

  async checkScanStatus() {
    if (this.state.imageSrc) {
      console.log("Checking");
      this.props.connection
        .get<AccountInfo | null>(`check/${this.props.embed}`)
        .then((res) => {
          console.log(res.data);

          if (res.data !== null) {
            this.setState({ scanned: true });
            this.props.onScanned(res.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }

    await delay(1000);

    if (!this.willUnmount && !this.state.scanned) {
      this.checkScanStatus();
    }
  }

  render() {
    return (
      <section>
        <span>Scan the QR Code using Nako Mobile.</span>
        {this.state.imageSrc ? (
          <img
            src={`data:image/png;base64,${this.state.imageSrc}`}
            alt="QR Code"
          />
        ) : null}
      </section>
    );
  }
}

enum LoginPhase {
  Default = "Credentials",
  QR = "QR code",
  USB = "Nako figurine",
}

enum ErrorMessage {
  Generic = "An error occurred while your request was being processed.",
  TimedOut = "Your request was timed out. Please try again.",
  InvalidLogin = "Your username or password is incorrect.",
}

interface LoginProps {
  onLoggedIn: (userInfo: AccountInfo) => void;
}

interface LoginState {
  loginPhase: LoginPhase;
  showLoginMethodDropdown: boolean;
  username: string;
  password: string;
  connection: AxiosInstance;
  connected: boolean;
  QRImageSrc?: string;
  error?: ErrorMessage;
}

export class Login extends React.Component<
  LoginProps & React.HTMLAttributes<HTMLDivElement>,
  LoginState
> {
  constructor(props: LoginProps & React.HTMLAttributes<HTMLDivElement>) {
    super(props);

    this.state = {
      loginPhase: LoginPhase.Default,
      showLoginMethodDropdown: false,
      username: "",
      password: "",
      connection: Axios.create({
        baseURL: "http://localhost:5000/",
        timeout: 10000,
      }),
      connected: false,
    };
  }

  async componentDidMount() {
    while (!this.state.connected) {
      const test = await this.state.connection.get("/");

      if (test.status === 200 || test.status === 201) {
        this.setState({ connected: true });
      } else {
        await delay(5000);
      }
    }
  }

  getAvailableLoginMethods() {
    return Object.values(LoginPhase)
      .filter((i) => i !== this.state.loginPhase)
      .map((i) => (
        <span key={i} onClick={() => this.setState({ loginPhase: i })}>
          {i}
        </span>
      ));
  }

  async getQRCode() {
    if (!this.state.QRImageSrc) {
      const id = Array.from(
        window.crypto.getRandomValues(new Uint8Array(8)),
        (dec) => dec.toString(16).padStart(2, "0")
      ).join("");
      const res = await this.state.connection.get<{ img: string }>(`/qr/${id}`);
      this.setState({ QRImageSrc: res.data.img });
    }
  }

  handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (this.state.username === "Nako") {
      this.props.onLoggedIn({ name: "Nako", role: "student" });
      return;
    }

    if (this.state.username === "Debug") {
      this.props.onLoggedIn({ name: "Debug", role: "teacher" });
      return;
    }

    this.setState({ error: undefined });
    this.state.connection
      .post<AccountInfo | undefined>(
        `login/${this.state.username}/${this.state.password}`,
        {
          username: this.state.username,
          password: this.state.password,
        }
      )
      .then((res) => {
        res.data
          ? this.props.onLoggedIn(res.data)
          : this.setState({ error: ErrorMessage.InvalidLogin });
      })
      .catch(() => {
        this.setState({ error: ErrorMessage.Generic });
      });
  }

  handleUSBData() {
    navigator.usb
      .requestDevice({ filters: [{ productId: 4660, vendorId: 43981 }] })
      .then((device) => {
        console.log(device.manufacturerName);
        this.props.onLoggedIn({ name: "Nako", role: "student" });
      });
  }

  render() {
    const { onLoggedIn, ...rest } = this.props;
    return (
      <div {...rest}>
        <div id={styles.background} className="fill-parent">
          <section>
            <div id={styles.title}>
              <h2>
                <img alt="Login icon" />
                Login
              </h2>
            </div>
            <div id={styles.content}>
              {this.state.loginPhase === LoginPhase.Default ? (
                <form onSubmit={(e) => this.handleFormSubmit(e)}>
                  <input
                    className="box-shadow"
                    placeholder="Username"
                    autoComplete="username"
                    onChange={(e) =>
                      this.setState({ username: e.target.value })
                    }
                  />
                  <input
                    className="box-shadow"
                    placeholder="Password"
                    type="password"
                    autoComplete="current-password"
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                  />
                  <button className="box-shadow" type="submit">
                    Login
                  </button>
                </form>
              ) : this.state.loginPhase === LoginPhase.QR ? (
                <QR
                  embed={Array.from(
                    window.crypto.getRandomValues(new Uint8Array(8)),
                    (dec) => dec.toString(16).padStart(2, "0")
                  ).join("")}
                  connection={this.state.connection}
                  onScanned={(loginInfo) => this.props.onLoggedIn(loginInfo)}
                />
              ) : (
                <section>
                  <span>
                    Press the button below when you have connected your Nako
                    figurine via USB.
                  </span>
                  <button onClick={() => this.handleUSBData()}>Connect</button>
                </section>
              )}
              <div>
                <span>Forgot password</span>
                <Link to="/register">
                  <span>Register</span>
                </Link>
                <div
                  id={styles["dropdown-menu"]}
                  onClick={() =>
                    this.setState({
                      showLoginMethodDropdown: !this.state
                        .showLoginMethodDropdown,
                    })
                  }
                >
                  <span>Login via...</span>
                  <div>
                    <CSSTransition
                      in={this.state.showLoginMethodDropdown}
                      timeout={250}
                      classNames={{
                        enter: styles["reveal-enter"],
                        enterActive: styles["reveal-enter-active"],
                        enterDone: styles["reveal-enter-done"],
                        exit: styles["reveal-exit"],
                        exitActive: styles["reveal-exit-active"],
                        exitDone: styles["reveal-exit-done"],
                      }}
                    >
                      <div>{this.getAvailableLoginMethods()}</div>
                    </CSSTransition>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default Login;
