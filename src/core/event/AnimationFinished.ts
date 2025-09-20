import { Entity } from "../models/Entity";

export class AnimationFinished {
  constructor(public readonly entity: Entity) {}
}
