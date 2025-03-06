import { PerspectiveCamera } from "three";

interface CameraProperties {
  offsetDistance?: number;
  offsetHeight?: number;
}

export class CameraComponent {
  public camera: PerspectiveCamera;
  public offsetDistance: number;
  public offsetHeight: number;

  constructor(config?: CameraProperties) {
    const { offsetDistance = 0.1, offsetHeight = 1 } = config ?? {};

    this.camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.offsetDistance = offsetDistance;
    this.offsetHeight = offsetHeight;
  }
}
