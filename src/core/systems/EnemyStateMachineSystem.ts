const { RigidBodyType } = await import("@dimforge/rapier3d");
import {
  EnemyStateComponent,
  EnemyTransitionEvent,
} from "../components/EnemyStateComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { AnimationFinished } from "../event/AnimationFinished";
import { Dead } from "../event/Dead";
import { EnemyStateTransition } from "../event/EnemyStateTransition";
import { EventBus } from "../event/EventBus";
import { GotDamaged } from "../event/GotDamaged";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class EnemyStateMachineSystem extends System {
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.eventBus = game.eventBus;

    this.handleAnimationFinished = this.handleAnimationFinished.bind(this);
    this.handleTransitionEvent = this.handleTransitionEvent.bind(this);
    this.handleGotDamageEvent = this.handleGotDamageEvent.bind(this);
    this.handleDeadEvent = this.handleDeadEvent.bind(this);

    this.eventBus.on(AnimationFinished, this.handleAnimationFinished);
    this.eventBus.on(EnemyStateTransition, this.handleTransitionEvent);
    this.eventBus.on(GotDamaged, this.handleGotDamageEvent);
    this.eventBus.on(Dead, this.handleDeadEvent);
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(EnemyStateComponent);
  }

  private transition(entity: Entity, event: EnemyTransitionEvent) {
    const stateComponent = entity.getComponent(EnemyStateComponent);
    if (!stateComponent) {
      console.log(
        "EnemyStateMachineSystem.transition: this entity doesn't have EnemyStateComponent",
      );
      return;
    }

    const next =
      stateComponent.transitions[stateComponent.currentState]?.[event];
    if (next !== undefined && next !== stateComponent.currentState) {
      stateComponent.currentState = next;
    }
  }

  private handleTransitionEvent(event: EnemyStateTransition): void {
    const { entity, transitionEvent } = event;
    this.transition(entity, transitionEvent);
  }

  private handleGotDamageEvent(event: GotDamaged): void {
    this.transition(event.entity, EnemyTransitionEvent.TakeDamage);
  }

  private handleDeadEvent(event: Dead): void {
    const { rigidBody, collider } =
      event.entity.getComponent(PhysicsComponent) ?? {};

    rigidBody?.setBodyType(RigidBodyType.KinematicPositionBased, true);
    collider?.setSensor(true);

    this.transition(event.entity, EnemyTransitionEvent.Die);
  }

  private handleAnimationFinished(event: AnimationFinished) {
    this.transition(event.entity, EnemyTransitionEvent.Finished);
  }
}
