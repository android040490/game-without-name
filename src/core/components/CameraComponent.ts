import { Object3D, PerspectiveCamera } from "three";

interface CameraProperties {
  offsetDistance?: number;
  offsetHeight?: number;
  cameraHolder: Object3D;
}

export class CameraComponent {
  public camera: PerspectiveCamera;
  public offsetDistance: number;
  public offsetHeight: number;
  public cameraHolder: Object3D;

  constructor(config: CameraProperties) {
    const { offsetDistance = 0, offsetHeight = 0, cameraHolder } = config;

    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.cameraHolder = cameraHolder;
    this.offsetDistance = offsetDistance;
    this.offsetHeight = offsetHeight;
  }
}
