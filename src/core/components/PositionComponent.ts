import { Vector3 } from "three";

export class PositionComponent {
  public position: Vector3;

  constructor(x: number, y: number, z: number) {
    this.position = new Vector3(x, y, z);
  }
}
