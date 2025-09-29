import { Entity } from "../models/Entity";

export class EnemyStateUpdated {
  constructor(public readonly entity: Entity) {}
}
