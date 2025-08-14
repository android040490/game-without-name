import { Vector3 } from "three";
import { Entity } from "../models/Entity";
import type { ImpulseJoint, JointType } from "@dimforge/rapier3d";

export class JointComponent {
  public joint?: ImpulseJoint;

  constructor(
    public readonly type: JointType,
    public readonly entity_1: Entity,
    public readonly entity_2: Entity,
    public readonly anchor_1: Vector3,
    public readonly anchor_2: Vector3,
    public readonly axis: Vector3,
  ) {}
}
