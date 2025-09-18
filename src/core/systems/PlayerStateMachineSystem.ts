import { PlayerStateComponent } from "../components/PlayerStateComponent";
import { EventBus } from "../event/EventBus";
import { StateTransition } from "../event/StateTransition";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export type StateTransitionEvent =
  | "shoot"
  | "reload"
  | "stop"
  | "move"
  | "run"
  | "finished";

export class PlayerStateMachineSystem extends System {
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;

    this.handleTransitionEvent = this.handleTransitionEvent.bind(this);

    this.eventBus.on(StateTransition, this.handleTransitionEvent);
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(PlayerStateComponent);
  }

  addEntity(entity: Entity): void {
    if (this.entities.size === 1) {
      console.error(
        "PlayerStateMachineSystem: a game cannot have more than one entity with a PlayerStateComponent. Attempting to add an entity: ",
        entity,
      );
      return;
    }
    super.addEntity(entity);
  }

  private transition(entity: Entity, event: StateTransitionEvent) {
    const stateComponent = entity.getComponent(PlayerStateComponent);
    if (!stateComponent) {
      console.log(
        "PlayerStateMachineSystem.transition: this entity doesn't have PlayerStateComponent",
      );
      return;
    }

    const next =
      stateComponent.transitions[stateComponent.currentState]?.[event];
    if (next !== undefined && next !== stateComponent.currentState) {
      stateComponent.currentState = next;
    }
  }

  private handleTransitionEvent(event: StateTransition) {
    const { entity, transitionEvent } = event;
    this.transition(entity, transitionEvent);
  }
}
