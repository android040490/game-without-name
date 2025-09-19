import { EnemyTransitionEvent } from "../components/EnemyStateComponent";
import { Entity } from "../models/Entity";

export class EnemyStateTransition {
  constructor(
    public readonly entity: Entity,
    public readonly transitionEvent: EnemyTransitionEvent,
  ) {}
}
