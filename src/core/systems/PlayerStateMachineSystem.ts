import { PlayerStateComponent } from "../components/PlayerStateComponent";
import { EventBus } from "../event/EventBus";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { PlayerTransitionEvent } from "../components/PlayerStateComponent";
import { AnimationFinished } from "../event/AnimationFinished";
import { PlayerStateTransition } from "../event/PlayerStateTransition";
import { WeaponShot } from "../event/WeaponShot";
import { WeaponReload } from "../event/WeaponReload";

export class PlayerStateMachineSystem extends System {
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;

    this.handleAnimationFinished = this.handleAnimationFinished.bind(this);
    this.handleTransitionEvent = this.handleTransitionEvent.bind(this);
    this.handleWeaponReload = this.handleWeaponReload.bind(this);
    this.handleWeaponShot = this.handleWeaponShot.bind(this);

    this.eventBus.on(AnimationFinished, this.handleAnimationFinished);
    this.eventBus.on(PlayerStateTransition, this.handleTransitionEvent);
    this.eventBus.on(WeaponShot, this.handleWeaponShot);
    this.eventBus.on(WeaponReload, this.handleWeaponReload);
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

  private transition(entity: Entity, event: PlayerTransitionEvent) {
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

  private handleAnimationFinished(event: AnimationFinished) {
    this.transition(event.entity, PlayerTransitionEvent.Finished);
  }

  private handleWeaponReload(event: WeaponShot) {
    this.transition(event.entity, PlayerTransitionEvent.Reload);
  }

  private handleWeaponShot(event: WeaponShot) {
    this.transition(event.entity, PlayerTransitionEvent.Shoot);
  }

  private handleTransitionEvent(event: PlayerStateTransition) {
    const { entity, transitionEvent } = event;
    this.transition(entity, transitionEvent);
  }
}
