import {
  Collider,
  KinematicCharacterController,
  RigidBody,
} from "@dimforge/rapier3d";
import { CharacterComponent } from "../components/CharacterComponent";
import { DirectionComponent } from "../components/DirectionComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import * as THREE from "three";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";

export class CharacterMovementSystem extends System {
  private characterController: KinematicCharacterController;
  constructor(game: Game) {
    super(game);

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
      const { direction } = entity.getComponent(DirectionComponent) ?? {};
      const { position } = entity.getComponent(PositionComponent) ?? {};
      const { rotation } = entity.getComponent(RotationComponent) ?? {};
      const { collider, rigidBody } =
        entity.getComponent(PhysicsComponent) ?? {};

      if (rigidBody && collider && direction && position && rotation) {
        this.moveCharacter(rigidBody, collider, direction, position, rotation);
      }
    }
  }

  private moveCharacter(
    rigidBody: RigidBody,
    collider: Collider,
    direction: THREE.Vector3,
    position: THREE.Vector3,
    rotation: THREE.Quaternion,
  ): void {
    const matrix = new THREE.Matrix4();
    matrix.lookAt(direction, position, new THREE.Vector3(0, 1, 0));

    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      matrix,
    );

    const quaternion = rotation.clone().slerp(targetQuaternion, 0.1);

    rigidBody.setRotation(
      { x: 0, y: quaternion.y, z: 0, w: quaternion.w },
      true,
    );
  }
}
