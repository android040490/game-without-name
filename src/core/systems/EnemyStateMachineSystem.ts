const { RigidBodyType } = await import("@dimforge/rapier3d");
import {
  EnemyState,
  EnemyStateComponent,
  EnemyTransitionEvent,
} from "../components/EnemyStateComponent";
import { HealthComponent } from "../components/HealthComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { SoundAsset } from "../constants/Sounds";
import { AnimationFinished } from "../event/AnimationFinished";
import { EnemyStateTransition } from "../event/EnemyStateTransition";
import { EnemyStateUpdated } from "../event/EnemyStateUpdated";
import { EventBus } from "../event/EventBus";
import { PlaySound } from "../event/PlaySound";
import { StopSound } from "../event/StopSound";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class EnemyStateMachineSystem extends System {
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;

    this.eventBus.on(
      AnimationFinished,
      this.handleAnimationFinished.bind(this),
    );
    this.eventBus.on(
      EnemyStateTransition,
      this.handleTransitionEvent.bind(this),
    );
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(EnemyStateComponent);
  }

  private transition(entity: Entity, event: EnemyTransitionEvent) {
    const stateComponent = entity.getComponent(EnemyStateComponent);
    if (!stateComponent) {
      return;
    }

    const next =
      stateComponent.transitions[stateComponent.currentState]?.[event];
    if (next !== undefined && next !== stateComponent.currentState) {
      stateComponent.currentState = next;
      this.eventBus.emit(new EnemyStateUpdated(entity));

      if (
        [EnemyState.ChaseWalk, EnemyState.ChaseRun, EnemyState.Attack].includes(
          next,
        )
      ) {
        this.eventBus.emit(new PlaySound(entity, SoundAsset.ZombieGroan, true));
      } else {
        this.eventBus.emit(new StopSound(entity, SoundAsset.ZombieGroan));
      }

      if (next === EnemyState.Scream) {
        this.eventBus.emit(new PlaySound(entity, SoundAsset.ZombieScream));
      }
      if (next === EnemyState.Dying) {
        this.eventBus.emit(new PlaySound(entity, SoundAsset.ZombieDying));
      }
    }
  }

  private handleTransitionEvent(event: EnemyStateTransition): void {
    const { entity, transitionEvent } = event;
    this.transition(entity, transitionEvent);
  }

  private handleGotDamage(entity: Entity): void {
    this.transition(entity, EnemyTransitionEvent.TakeDamage);
  }

  private handleDead(entity: Entity): void {
    const { rigidBody, collider } = entity.getComponent(PhysicsComponent) ?? {};

    rigidBody?.setBodyType(RigidBodyType.KinematicPositionBased, true);
    collider?.setSensor(true);

    this.transition(entity, EnemyTransitionEvent.Die);
  }

  private handleAnimationFinished(event: AnimationFinished) {
    this.transition(event.entity, EnemyTransitionEvent.Finished);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const healthComponent = entity.getComponent(HealthComponent);

      if (!healthComponent) {
        continue;
      }
      const { damage, isDead } = healthComponent;

      if (isDead) {
        this.handleDead(entity);
      }

      if (damage) {
        this.handleGotDamage(entity);
      }
    }
  }
}
