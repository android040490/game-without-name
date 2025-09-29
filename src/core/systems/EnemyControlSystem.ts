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
import { LifetimeComponent } from "../components/LifetimeComponent";
import {
  EnemyState,
  EnemyStateComponent,
} from "../components/EnemyStateComponent";

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
    return entity.hasComponents(EnemyComponent, CharacterMovementComponent);
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
      const { currentState } = entity.getComponent(EnemyStateComponent)!;

      if (currentState === EnemyState.Dead) {
        if (!entity.hasComponent(LifetimeComponent)) {
          entity.addComponent(new LifetimeComponent(5));
        }

        continue;
      }

      let speed = 0;

      if (currentState === EnemyState.ChaseWalk) {
        speed = 1;
      }

      if (currentState === EnemyState.ChaseRun) {
        speed = 3;
      }

      if (
        position &&
        rotation &&
        currentState !== EnemyState.Damaged &&
        currentState !== EnemyState.Dying
      ) {
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
}
