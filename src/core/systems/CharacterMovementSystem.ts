const { QueryFilterFlags } = await import("@dimforge/rapier3d");
import type {
  Collider,
  KinematicCharacterController,
  RigidBody,
} from "@dimforge/rapier3d";
import { CharacterMovementComponent } from "../components/CharacterMovementComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import * as THREE from "three";

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
    return entity.hasComponents(CharacterMovementComponent, PhysicsComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { rotation, position } = entity.getComponent(
        CharacterMovementComponent,
      )!;
      const { collider, rigidBody } =
        entity.getComponent(PhysicsComponent) ?? {};

      if (rigidBody && rotation) {
        this.rotateCharacter(rigidBody, rotation);
      }
      if (rigidBody && collider && position) {
        this.moveCharacter(rigidBody, collider, position);
      }
    }
  }

  private rotateCharacter(
    rigidBody: RigidBody,
    rotation: THREE.Quaternion,
  ): void {
    rigidBody.setRotation({ x: 0, y: rotation.y, z: 0, w: rotation.w }, true); // TODO: update this
  }

  private moveCharacter(
    rigidBody: RigidBody,
    collider: Collider,
    position: THREE.Vector3,
  ): void {
    this.characterController.computeColliderMovement(
      collider,
      { x: position.x, y: 0, z: position.z }, // The collider we would like to move.
      QueryFilterFlags.EXCLUDE_SENSORS,
      collider.collisionGroups(),
    );

    // Read the result.
    let correctedMovement = this.characterController.computedMovement();

    const prevPosition = new THREE.Vector3().copy(rigidBody.translation());

    const newPosition = prevPosition.add(correctedMovement);

    rigidBody.setTranslation(newPosition, true);
  }
}
