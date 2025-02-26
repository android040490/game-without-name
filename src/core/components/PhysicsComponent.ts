import { Collider, RigidBody } from "@dimforge/rapier3d";
import { PhysicalObjectParams } from "../managers/PhysicsManager";

export class PhysicsComponent {
  public rigidBody?: RigidBody;
  public collider?: Collider;
  constructor(public config: PhysicalObjectParams) {}
}
