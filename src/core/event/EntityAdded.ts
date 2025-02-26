import { Entity } from "../models/Entity";

export class EntityAdded {
  constructor(public readonly entity: Entity) {}
}
