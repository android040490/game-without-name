import { Collider, RigidBody } from "@dimforge/rapier3d";
import { PhysicalObjectConfig } from "../managers/PhysicsManager";

export class PhysicsComponent {
  public rigidBody?: RigidBody;
  public collider?: Collider;
  constructor(public config: PhysicalObjectConfig) {}
}
