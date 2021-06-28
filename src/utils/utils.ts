export async function animate(className: string, node: HTMLElement, timeout: number) {
  if (!node.className.includes(` ${className}`)) {
    node.className += ` ${className}`;
    await new Promise(res => setTimeout(res, timeout));
    node.className = node.className.replace(` ${className}`, "");
  }
}

export function delay(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms));
}

export async function waitForVideoData(video: HTMLVideoElement) {
  return new Promise<void>(resolve => {
    video.onloadeddata = () => {
      resolve();
    };
  });
}

export function clamp(value: number, min = 0, max = 1) {
  return value < min ? min : value > max ? max : value;
}