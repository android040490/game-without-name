import * as THREE from "three";
import { EnemyComponent } from "../components/EnemyComponent";
import { TargetDirectionComponent } from "../components/TargetDirectionComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";
import { VelocityComponent } from "../components/VelocityComponent";
import { CharacterMovementComponent } from "../components/CharacterMovementComponent";
import { Game } from "../Game";
import { TimeManager } from "../managers/TimeManager";

export class EnemyControlSystem extends System {
  private timeManager: TimeManager;

  constructor(game: Game) {
    super(game);

    this.timeManager = game.timeManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      EnemyComponent,
      CharacterMovementComponent,
      TargetDirectionComponent,
    );
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { direction } = entity.getComponent(TargetDirectionComponent)!;
      const { position } = entity.getComponent(PositionComponent) ?? {};
      const { rotation } = entity.getComponent(RotationComponent) ?? {};
      const characterMovementComponent = entity.getComponent(
        CharacterMovementComponent,
      )!;
      const { velocity } = entity.getComponent(VelocityComponent) ?? {};

      if (position && rotation) {
        characterMovementComponent.rotation = this.computeNextRotation(
          direction,
          position,
          rotation,
        );
      }
      if (position && velocity) {
        characterMovementComponent.position = this.computeNextPosition(
          direction,
          position,
          velocity,
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
    velocity: number,
  ): THREE.Vector3 {
    const delta = this.timeManager.delta / 1000;

    const nextPosition = targetDirection.clone().sub(position).normalize();
    return nextPosition.multiplyScalar(velocity * delta);
  }
}
