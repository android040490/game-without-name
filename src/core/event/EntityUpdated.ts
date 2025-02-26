import { Entity } from "../models/Entity";

export class EntityUpdated {
  constructor(public readonly entity: Entity) {}
}
