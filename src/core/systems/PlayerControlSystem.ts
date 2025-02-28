import * as THREE from "three";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { RotationComponent } from "../components/RotationComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { TimeManager } from "../managers/TimeManager";
import { KinematicCharacterController } from "@dimforge/rapier3d";

export class PlayerControlSystem extends System {
  private readonly timeManager: TimeManager;
  private readonly minSpeed = 0.3;
  private readonly maxSpeed = 1;
  private speed: number;
  private characterController: KinematicCharacterController;
  private velocity: THREE.Vector3;
  private moveForward = false;
  private moveLeft = false;
  private moveBackward = false;
  private moveRight = false;

  constructor(game: Game) {
    super(game);

    this.timeManager = this.game.timeManager;
    this.speed = this.minSpeed;
    this.velocity = new THREE.Vector3();

    let offset = 0.01;
    this.characterController =
      game.physicsManager.createCharacterController(offset);
    this.characterController.enableSnapToGround(0.5);
    this.characterController.setApplyImpulsesToDynamicBodies(true);
    this.characterController.setMinSlopeSlideAngle((10 * Math.PI) / 180);

    document.addEventListener("keydown", (e: KeyboardEvent) =>
      this.handleKeyboardEvent(e),
    );
    document.addEventListener("keyup", (e: KeyboardEvent) =>
      this.handleKeyboardEvent(e),
    );
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      PlayerComponent,
      PhysicsComponent,
      RotationComponent,
    );
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { rigidBody, collider } = entity.getComponent(PhysicsComponent)!;
      const { rotation } = entity.getComponent(RotationComponent)!;

      if (!collider || !rigidBody) {
        continue;
      }

      const delta = this.timeManager.delta / 1000;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.x -= this.velocity.x * 10.0 * delta;

      const direction = new THREE.Vector3();

      direction.z = Number(this.moveBackward) - Number(this.moveForward);
      direction.x = Number(this.moveRight) - Number(this.moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (this.moveForward || this.moveBackward) {
        this.velocity.z += direction.z * 2 * delta * this.speed;
      }

      if (this.moveLeft || this.moveRight) {
        this.velocity.x += direction.x * 2 * delta * this.speed;
      }

      const movement = this.velocity
        .clone()
        .normalize()
        .applyQuaternion(rotation)
        .multiplyScalar(this.velocity.length());

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

  private handleKeyboardEvent(event: KeyboardEvent): void {
    const isKeyDown = event.type === "keydown";

    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.moveForward = isKeyDown;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.moveLeft = isKeyDown;
        break;

      case "ArrowDown":
      case "KeyS":
        this.moveBackward = isKeyDown;
        break;

      case "ArrowRight":
      case "KeyD":
        this.moveRight = isKeyDown;
        break;

      case "ShiftLeft":
        this.speed = isKeyDown ? this.maxSpeed : this.minSpeed;
    }
  }
}
