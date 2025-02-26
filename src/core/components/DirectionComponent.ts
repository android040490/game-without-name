import { Vector3 } from "three";

export class DirectionComponent {
  public direction: Vector3;

  constructor(x: number, y: number, z: number) {
    this.direction = new Vector3(x, y, z);
  }
}
