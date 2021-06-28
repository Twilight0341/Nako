import React from "react";
import Axios from "axios";
import { isAccountInfo, AccountInfo } from "../../modules/account-info";
import styles from "./login.module.scss";
import QRScanner from "../../modules/qr-scanner/qr-scanner";
import Logo from "../../modules/logo/logo";
import { delay } from "../../utils/utils";

enum LoginPhase {
  menu,
  NFC,
  QR,
}

interface LoginProps {
  serverURL: string;
}

interface LoginState {
  nfcCapable: boolean;
  loginPhase: LoginPhase;
  controller: AbortController;
  loginInfo?: AccountInfo;
}

export class Login extends React.Component<
  LoginProps & React.HTMLAttributes<HTMLDivElement>,
  LoginState
> {
  static defaultProps = {
    serverURL: "http://113.252.44.34:5000/",
  };

  private NDEF = new NDEFReader();
  private UTF8Decoder = new TextDecoder();

  constructor(props: LoginProps & React.HTMLAttributes<HTMLDivElement>) {
    super(props);

    this.state = {
      nfcCapable: true,
      loginPhase: LoginPhase.menu,
      controller: new AbortController(),
    };

    this.NDEF.onreading = async (e) => {
      // console.log(e.serialNumber);
      // console.log(e.message.records);
      const info = JSON.parse(
        this.UTF8Decoder.decode(e.message.records[0].data?.buffer)
      );
      console.log(info);

      if (isAccountInfo(info)) {
        this.setState({ loginInfo: info, loginPhase: LoginPhase.menu });
        await delay(1000);
        this.endNFCScan();
      }
    };
  }

  componentWillUnmount() {
    this.state.controller.abort();
  }

  //#region NFC
  startNFCScan() {
    this.NDEF.scan(this.state.controller)
      .then(() => this.setState({ loginPhase: LoginPhase.NFC }))
      .catch((error) => {
        console.log(error);
        this.endNFCScan();
        this.setState({ loginPhase: LoginPhase.menu, nfcCapable: false });
      });
  }

  endNFCScan() {
    this.state.controller.abort();
    this.setState({ controller: new AbortController() });
  }

  initNFC() {
    this.NDEF.write(
      JSON.stringify({
        name: "Nako",
      })
    )
      .then(() => console.log("Message written"))
      .catch((error) => console.log(error));
  }
  //#endregion

  //#region QR
  handleQRData(data: string) {
    console.log(`${data}/${JSON.stringify(this.state.loginInfo!)}`);

    Axios.get(
      `${data.replace("192.168.0.105", "113.252.44.34")}/${JSON.stringify(this.state.loginInfo!)}`
    ).catch((error) => console.log(error));
  }
  //#endregion

  render() {
    const { serverURL, ...rest } = this.props;
    return (
      <div {...rest}>
        <div className={`${styles["m-login-container"]} fill-parent`}>
          {this.state.loginInfo ? (
            <>
              <h1>Welcome back, {this.state.loginInfo.name}!</h1>
              <button
                onClick={() => this.setState({ loginPhase: LoginPhase.QR })}
              >
                Desktop login with QR code
              </button>
              {this.state.loginPhase === LoginPhase.QR ? (
                <div id={styles.qr} className={`${styles.overlay} fill-parent`}>
                  <span
                    className="close"
                    onClick={() =>
                      this.setState({ loginPhase: LoginPhase.menu })
                    }
                  />
                  <div>
                    <p>Scan the QR code shown on the webpage.</p>
                    <QRScanner
                      className={styles["qr-component"]}
                      onScannedData={(data) => this.handleQRData(data)}
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Logo id={styles.logo} role="student" />
              <button onClick={() => this.startNFCScan()}>
                Login using NFC
              </button>
              {/*<button onClick={() => this.initNFC()}>Init NFC card</button> 
              <button
                onClick={() =>
                  this.setState({
                    loginInfo: { name: "Nako", role: "student" },
                  })
                }
              >
                Debug
              </button>*/}
              {this.state.loginPhase === LoginPhase.NFC ? (
                <div
                  id={styles.nfc}
                  className={`${styles.overlay} fill-parent`}
                >
                  <span
                    className="close"
                    onClick={() => {
                      this.endNFCScan();
                      this.setState({ loginPhase: LoginPhase.menu });
                    }}
                  />
                  <div>
                    <p>Place your Nako card on the back of your device.</p>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default Login;
