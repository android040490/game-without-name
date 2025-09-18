import { Entity } from "../models/Entity";
import { StateTransitionEvent } from "../systems/PlayerStateMachineSystem";

export class StateTransition {
  constructor(
    public readonly entity: Entity,
    public readonly transitionEvent: StateTransitionEvent,
  ) {}
}
