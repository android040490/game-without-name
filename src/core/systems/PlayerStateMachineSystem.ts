import {
  PlayerMovementState,
  PlayerStateComponent,
} from "../components/PlayerStateComponent";
import { EventBus } from "../event/EventBus";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { PlayerTransitionEvent } from "../components/PlayerStateComponent";
import { AnimationFinished } from "../event/AnimationFinished";
import { PlayerMovementStateTransition } from "../event/PlayerMovementStateTransition";
import { WeaponShot } from "../event/WeaponShot";
import { WeaponReload } from "../event/WeaponReload";
import { StopSound } from "../event/StopSound";
import { PlaySound } from "../event/PlaySound";
import { SoundAsset } from "../constants/Sounds";

export class PlayerStateMachineSystem extends System {
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;

    this.eventBus.on(
      AnimationFinished,
      this.handleAnimationFinished.bind(this),
    );
    this.eventBus.on(
      PlayerMovementStateTransition,
      this.handleMovementTransitionEvent.bind(this),
    );
    this.eventBus.on(WeaponShot, this.handleWeaponShot.bind(this));
    this.eventBus.on(WeaponReload, this.handleWeaponReload.bind(this));
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

  private transitionMovement(entity: Entity, event: PlayerTransitionEvent) {
    const state = entity.getComponent(PlayerStateComponent);
    if (!state) {
      console.debug(
        "PlayerStateMachineSystem.transitionMovement: this entity doesn't have PlayerStateComponent",
      );
      return;
    }

    const next = state.movementTransitions[state.movementState]?.[event];
    if (next !== undefined && next !== state.movementState) {
      state.movementState = next;

      // TODO: think about refactoring sound management
      if (
        next === PlayerMovementState.Airborne ||
        next === PlayerMovementState.Idle ||
        next === PlayerMovementState.Dead
      ) {
        this.eventBus.emit(new StopSound(entity, SoundAsset.PlayerRunGravel));
        this.eventBus.emit(new StopSound(entity, SoundAsset.PlayerWalkGravel));
      }
      if (next === PlayerMovementState.Run) {
        this.eventBus.emit(new StopSound(entity, SoundAsset.PlayerWalkGravel));
        this.eventBus.emit(
          new PlaySound(entity, SoundAsset.PlayerRunGravel, true),
        );
      } else if (next === PlayerMovementState.Walk) {
        this.eventBus.emit(new StopSound(entity, SoundAsset.PlayerRunGravel));
        this.eventBus.emit(
          new PlaySound(entity, SoundAsset.PlayerWalkGravel, true),
        );
      }
    }
  }

  private transitionAction(entity: Entity, event: PlayerTransitionEvent) {
    const state = entity.getComponent(PlayerStateComponent);
    if (!state) {
      console.debug(
        "PlayerStateMachineSystem.transitionAction: this entity doesn't have PlayerStateComponent",
      );
      return;
    }

    const next = state.actionTransitions[state.actionState]?.[event];
    if (next !== undefined && next !== state.actionState) {
      state.actionState = next;
    }
  }

  private handleAnimationFinished(event: AnimationFinished) {
    this.transitionAction(event.entity, PlayerTransitionEvent.Finished);
  }

  private handleWeaponReload(event: WeaponShot) {
    this.transitionAction(event.entity, PlayerTransitionEvent.Reload);
  }

  private handleWeaponShot(event: WeaponShot) {
    this.transitionAction(event.entity, PlayerTransitionEvent.Shoot);
  }

  private handleMovementTransitionEvent(event: PlayerMovementStateTransition) {
    const { entity, transitionEvent } = event;
    this.transitionMovement(entity, transitionEvent);
  }
}
