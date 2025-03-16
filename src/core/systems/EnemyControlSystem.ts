import * as THREE from "three";
import { EnemyComponent } from "../components/EnemyComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";
import { CharacterMovementComponent } from "../components/CharacterMovementComponent";
import { Game } from "../Game";
import { TimeManager } from "../managers/TimeManager";
import { EventBus } from "../event/EventBus";
import { PlayerPositionUpdated } from "../event/PlayerPositionUpdated";
import {
  CharacterState,
  CharacterStateComponent,
} from "../components/CharacterStateComponent";
import { EnemyStates } from "../constants/EnemyStates";
import { AnimationComponent } from "../components/AnimationComponent";
import { DeadMarkerComponent } from "../components/DeadMarkerComponent";
import { DamagedMarkerComponent } from "../components/DamagedMarkerComponent";

export class EnemyControlSystem extends System {
  private readonly timeManager: TimeManager;
  private readonly eventBus: EventBus;

  private targetDirection?: THREE.Vector3;

  constructor(game: Game) {
    super(game);

    this.timeManager = game.timeManager;
    this.eventBus = game.eventBus;

    this.eventBus.on(PlayerPositionUpdated, (event) => {
      this.targetDirection = event.position;
    });
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      EnemyComponent,
      CharacterMovementComponent,
      CharacterStateComponent,
    );
  }

  update(): void {
    if (!this.targetDirection) {
      return;
    }

    for (const [_, entity] of this.entities) {
      const { position } = entity.getComponent(PositionComponent) ?? {};
      const { rotation } = entity.getComponent(RotationComponent) ?? {};
      const characterMovementComponent = entity.getComponent(
        CharacterMovementComponent,
      )!;
      const stateComponent = entity.getComponent(CharacterStateComponent)!;
      const animationComponent = entity.getComponent(AnimationComponent);
      const newState = this.computeNextCharacterState(entity);
      stateComponent.currentState = newState;

      if (animationComponent) {
        animationComponent.animation = newState.animation;

        animationComponent.completeHandler = () => {
          if (newState.nextState) {
            stateComponent.currentState = newState.nextState;
          }
        };
      }

      const { speed } = newState;

      if (position && rotation) {
        characterMovementComponent.rotation = this.computeNextRotation(
          this.targetDirection,
          position,
          rotation,
        );
      }
      if (position) {
        characterMovementComponent.position = this.computeNextPosition(
          this.targetDirection,
          position,
          speed,
        );
      }
    }
  }

  private computeNextRotation(
    targetDirection: THREE.Vector3,
    position: THREE.Vector3,
    rotation: THREE.Quaternion,
  ): THREE.Quaternion {
    const matrix = new THREE.Matrix4();
    matrix.lookAt(targetDirection, position, new THREE.Vector3(0, 1, 0));

    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      matrix,
    );

    return rotation.clone().slerp(targetQuaternion, 0.05);
  }

  private computeNextPosition(
    targetDirection: THREE.Vector3,
    position: THREE.Vector3,
    speed: number,
  ): THREE.Vector3 {
    const delta = this.timeManager.timeStep;

    const nextPosition = targetDirection.clone().sub(position).normalize();
    return nextPosition.multiplyScalar(speed * delta);
  }

  private computeNextCharacterState(entity: Entity): CharacterState {
    const { currentState } = entity.getComponent(CharacterStateComponent)!;
    const isDead = entity.getComponent(DeadMarkerComponent)!;
    const isDamaged = entity.getComponent(DamagedMarkerComponent);

    let nextState = currentState;

    if (isDead) {
      console.log("isDead");
      nextState = EnemyStates.Idle;
    } else if (isDamaged) {
      entity.removeComponent(DamagedMarkerComponent);
      nextState = EnemyStates.Damaged;
    } else if (currentState === EnemyStates.Idle) {
      nextState = EnemyStates.Walk;
    }

    return nextState;
  }
}
