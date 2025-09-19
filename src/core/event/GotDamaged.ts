import { Entity } from "../models/Entity";

export class GotDamaged {
  constructor(public readonly entity: Entity) {}
}
