import * as THREE from "three";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { RotationComponent } from "../components/RotationComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { TimeManager } from "../managers/TimeManager";
import { CharacterMovementComponent } from "../components/CharacterMovementComponent";
import { Collider, RigidBody } from "@dimforge/rapier3d";
import { PhysicsManager } from "../managers/PhysicsManager";

export class PlayerControlSystem extends System {
  private readonly timeManager: TimeManager;
  private readonly physicsManager: PhysicsManager;
  private readonly minSpeed = 0.3;
  private readonly maxSpeed = 1;
  private speed: number;
  private velocity: THREE.Vector3;
  private moveForward = false;
  private moveLeft = false;
  private moveBackward = false;
  private moveRight = false;
  private jumpInitiated = false;

  constructor(game: Game) {
    super(game);

    this.timeManager = game.timeManager;
    this.physicsManager = game.physicsManager;
    this.speed = this.minSpeed;
    this.velocity = new THREE.Vector3();

    this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      PlayerComponent,
      CharacterMovementComponent,
      PhysicsComponent, // TODO: maybe to move the check for this component to the add entity method
      RotationComponent, // TODO: maybe to move the check for this component to the add entity method
    );
  }

  addEntity(entity: Entity): void {
    if (this.entities.size === 1) {
      console.error(
        "PlayerControlSystem: a game cannot have more than one entity with a PlayerComponent. Attempting to add an entity: ",
        entity,
      );
      return;
    }
    super.addEntity(entity);
    this.setListeners();
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    this.removeListeners();
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { rigidBody, collider } = entity.getComponent(PhysicsComponent)!;
      const { rotation } = entity.getComponent(RotationComponent)!;
      const characterMovementComponent = entity.getComponent(
        CharacterMovementComponent,
      )!;

      if (!collider || !rigidBody) {
        continue;
      }

      characterMovementComponent.position = this.computeNextMovement(rotation);

      if (this.jumpInitiated && this.detectGround(rigidBody, collider)) {
        this.jump(rigidBody);
      }
      this.jumpInitiated = false;
    }
  }

  private jump(rigidBody: RigidBody): void {
    rigidBody.applyImpulse(
      {
        x: 0,
        y: 10,
        z: 0,
      },
      true,
    );
  }

  private detectGround(rigidBody: RigidBody, collider: Collider): boolean {
    const position = rigidBody.translation();

    const hit = this.physicsManager.castRay(
      position,
      {
        x: 0.0,
        y: -1,
        z: 0.0,
      },
      1, // TODO: get half the height of the body so as not to have this value hardcoded
      true,
      undefined,
      undefined,
      collider,
    );

    return !!hit?.collider;
  }

  private computeNextMovement(
    currentRotation: THREE.Quaternion,
  ): THREE.Vector3 {
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

    return this.velocity
      .clone()
      .normalize()
      .applyQuaternion(currentRotation)
      .multiplyScalar(this.velocity.length());
  }

  private setListeners(): void {
    document.addEventListener("keydown", this.handleKeyboardEvent);
    document.addEventListener("keyup", this.handleKeyboardEvent);
  }

  private removeListeners(): void {
    document.removeEventListener("keydown", this.handleKeyboardEvent);
    document.removeEventListener("keyup", this.handleKeyboardEvent);
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

      case "Space":
        if (isKeyDown) this.jumpInitiated = true;
        break;

      case "ShiftLeft":
        this.speed = isKeyDown ? this.maxSpeed : this.minSpeed;
    }
  }
}
