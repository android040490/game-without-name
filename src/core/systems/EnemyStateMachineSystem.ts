import {
  EnemyState,
  EnemyStateComponent,
  EnemyTransitionEvent,
} from "../components/EnemyStateComponent";
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

  private handleAnimationFinished(event: AnimationFinished) {
    this.transition(event.entity, EnemyTransitionEvent.Finished);
  }
}
