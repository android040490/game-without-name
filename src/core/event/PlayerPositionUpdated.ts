import { Vector3 } from "three";

export class PlayerPositionUpdated {
  constructor(public readonly position: Vector3) {}
}
