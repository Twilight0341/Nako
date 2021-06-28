import React from "react";
import jsQR from "jsqr";
import { delay, waitForVideoData } from "../../utils/utils";
import styles from "./qr-scanner.module.scss";

interface QRScannerProps {
  onScannedData: (data: string) => void;
  interval: number;
  resolution: number;
}

interface QRScannerStates {
  canvas: HTMLCanvasElement;
}

export class QRScanner extends React.Component<QRScannerProps & React.HTMLAttributes<HTMLDivElement>, QRScannerStates> {
  static defaultProps = {
    interval: 500,
    resolution: 600
  };

  private videoRef = React.createRef<HTMLVideoElement>();
  private stream?: MediaStream;

  constructor(props: QRScannerProps) {
    super(props);

    this.state = {
      canvas: document.createElement("canvas")
    };
  }

  componentDidMount() {
    const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    const constraints: MediaTrackConstraints = {};

    if (supportedConstraints.facingMode) {
      constraints.facingMode = { ideal: "environment" };
    }

    navigator.mediaDevices.getUserMedia({ video: constraints }).then(stream => {
      this.stream = stream;
      this.videoRef.current!.srcObject = stream;
      waitForVideoData(this.videoRef.current!).then(() => {
        this.videoRef.current!.play().then(() => {
          this.beginUpdateCanvas(this.videoRef.current!, this.state.canvas);
        });
      });
    }).catch(error =>
      console.log(error)
    );
  }

  componentWillUnmount() {
    this.stream?.getTracks().forEach(track => {
      this.stream?.removeTrack(track);    // Workaround for https://issuetracker.google.com/u/0/issues/173142922
      track.stop();                       // from https://github.com/twilio/twilio-video-app-react/issues/355#issuecomment-780368725
    });
  }

  beginUpdateCanvas(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    const canvasContext = canvas.getContext("2d")!;
    canvas.height = this.props.resolution;
    canvas.width = this.props.resolution;
    const aspectRatio = video.videoWidth / video.videoHeight;
    const srcResolution = Math.min(video.videoWidth, video.videoHeight);
    const offsetX = aspectRatio > 1 ? (video.videoWidth - video.videoHeight) / 2 : 0;
    const offsetY = aspectRatio < 1 ? (video.videoHeight - video.videoWidth) / 2 : 0;

    const canvasUpdateLoop = async () => {
      try {
        canvasContext.drawImage(video, offsetX, offsetY, srcResolution, srcResolution, 0, 0, this.props.resolution, this.props.resolution);
        const code = jsQR(canvasContext.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, {
          inversionAttempts: "dontInvert"
        });

        if (code) {
          this.props.onScannedData(code.data);
        }
      } catch (error) {
        console.log(error);
      }

      await delay(this.props.interval);
      requestAnimationFrame(canvasUpdateLoop);
    };

    canvasUpdateLoop();
  }

  render() {
    const { onScannedData, interval, ...rest } = this.props;
    return (
      <div {...rest}>
        <section id={styles.container}>
          <div/>
          <video ref={this.videoRef}/>
        </section>
      </div>
    );
  }
}

export default QRScanner;