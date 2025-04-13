import { Entity } from "../models/Entity";
import { Constructor } from "../type-utils/constructor";

export type CollisionHandler = {
  entity1Components: Constructor[];
  entity2Components: Constructor[];
  handler: (entity1: Entity, entity2: Entity) => void;
};

export const COLLISION_HANDLERS: CollisionHandler[] = [];
