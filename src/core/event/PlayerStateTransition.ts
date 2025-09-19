import { PlayerTransitionEvent } from "../components/PlayerStateComponent";
import { Entity } from "../models/Entity";

export class PlayerStateTransition {
  constructor(
    public readonly entity: Entity,
    public readonly transitionEvent: PlayerTransitionEvent,
  ) {}
}
