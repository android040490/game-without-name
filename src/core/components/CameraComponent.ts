import { PerspectiveCamera } from "three";

interface CameraProperties {
  offsetDistance?: number;
}

export class CameraComponent {
  public camera?: PerspectiveCamera;
  public offsetDistance: number;

  constructor(props?: CameraProperties) {
    const { offsetDistance = 0.1 } = props ?? {};

    this.offsetDistance = offsetDistance;
  }
}
