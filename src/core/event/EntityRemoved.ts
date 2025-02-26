import { Entity } from "../models/Entity";

export class EntityRemoved {
  constructor(public readonly entity: Entity) {}
}
