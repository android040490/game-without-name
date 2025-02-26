import {
  Collider,
  KinematicCharacterController,
  RigidBody,
} from "@dimforge/rapier3d";
import { CharacterComponent } from "../components/CharacterComponent";
import { TargetDirectionComponent } from "../components/TargetDirectionComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import * as THREE from "three";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";
import { VelocityComponent } from "../components/VelocityComponent";
import { TimeManager } from "../managers/TimeManager";

export class CharacterMovementSystem extends System {
  private characterController: KinematicCharacterController;
  private timeManager: TimeManager;

  constructor(game: Game) {
    super(game);

    this.timeManager = game.timeManager;
    const physicsManager = game.physicsManager;
    let offset = 0.01;
    this.characterController = physicsManager.createCharacterController(offset);
    this.characterController.enableSnapToGround(0.5);
    this.characterController.setApplyImpulsesToDynamicBodies(true);
    this.characterController.setMinSlopeSlideAngle((10 * Math.PI) / 180);
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(CharacterComponent, PhysicsComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { direction } = entity.getComponent(TargetDirectionComponent) ?? {};
      const { position } = entity.getComponent(PositionComponent) ?? {};
      const { rotation } = entity.getComponent(RotationComponent) ?? {};
      const { velocity } = entity.getComponent(VelocityComponent) ?? {};
      const { collider, rigidBody } =
        entity.getComponent(PhysicsComponent) ?? {};

      if (rigidBody && direction && position && rotation) {
        this.rotateCharacter(rigidBody, direction, position, rotation);
      }
      if (rigidBody && collider && direction && position && velocity) {
        this.moveCharacter(rigidBody, collider, direction, position, velocity);
      }
    }
  }

  private rotateCharacter(
    rigidBody: RigidBody,
    targetDirection: THREE.Vector3,
    position: THREE.Vector3,
    rotation: THREE.Quaternion,
  ): void {
    const matrix = new THREE.Matrix4();
    matrix.lookAt(targetDirection, position, new THREE.Vector3(0, 1, 0));

    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      matrix,
    );

    const quaternion = rotation.clone().slerp(targetQuaternion, 0.05);

    rigidBody.setRotation(
      { x: 0, y: quaternion.y, z: 0, w: quaternion.w },
      true,
    );
  }

  private moveCharacter(
    rigidBody: RigidBody,
    collider: Collider,
    targetDirection: THREE.Vector3,
    position: THREE.Vector3,
    velocity: number,
  ): void {
    const direction = targetDirection.clone().sub(position).normalize();
    const movement = direction.multiplyScalar(
      (velocity * this.timeManager.delta) / 1000,
    );

    this.characterController.computeColliderMovement(
      collider,
      { x: movement.x, y: 0, z: movement.z }, // The collider we would like to move.
    );

    // Read the result.
    let correctedMovement = this.characterController.computedMovement();

    const prevPosition = new THREE.Vector3().copy(rigidBody.translation());

    const newPosition = prevPosition.add(correctedMovement);

    rigidBody.setTranslation(
      {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
      },
      true,
    );
  }
}
