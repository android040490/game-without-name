import { Quaternion, Vector3 } from "three";

export class CharacterMovementComponent {
  public rotation: Quaternion;
  public position: Vector3;

  constructor() {
    this.rotation = new Quaternion();
    this.position = new Vector3();
  }
}
