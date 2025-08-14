import type { Collider, RigidBody } from "@dimforge/rapier3d";
import * as THREE from "three";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { RotationComponent } from "../components/RotationComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { TimeManager } from "../managers/TimeManager";
import { CharacterMovementComponent } from "../components/CharacterMovementComponent";
import { PhysicsManager } from "../managers/PhysicsManager";
import { PlayerControlComponent } from "../components/PlayerControlComponent";
import { PlayerConfigComponent } from "../components/PlayerConfigComponent";
import { AnimationComponent } from "../components/AnimationComponent";
import { PlayerAnimations } from "../constants/PlayerAnimations";

export class PlayerControlSystem extends System {
  private readonly timeManager: TimeManager;
  private readonly physicsManager: PhysicsManager;
  private moveForward = false;
  private moveLeft = false;
  private moveBackward = false;
  private moveRight = false;
  private jumpInitiated = false;
  private accelerate = false;
  private attackInitiated = false;

  constructor(game: Game) {
    super(game);

    this.timeManager = game.timeManager;
    this.physicsManager = game.physicsManager;

    this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      PlayerControlComponent,
      CharacterMovementComponent,
      PlayerConfigComponent,
      PhysicsComponent, // TODO: maybe to move the check for this component to the add entity method
      RotationComponent, // TODO: maybe to move the check for this component to the add entity method
    );
  }

  addEntity(entity: Entity): void {
    if (this.entities.size === 1) {
      console.error(
        "PlayerControlSystem: a game cannot have more than one entity with a PlayerControlComponent. Attempting to add an entity: ",
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
      const animationComponent = entity.getComponent(AnimationComponent);
      const { rotation } = entity.getComponent(RotationComponent)!;
      const characterMovementComponent = entity.getComponent(
        CharacterMovementComponent,
      )!;
      const { height } = entity.getComponent(PlayerConfigComponent)!;
      const player = entity.getComponent(PlayerControlComponent)!;

      if (!collider || !rigidBody) {
        continue;
      }

      player.accelerate = this.accelerate;

      characterMovementComponent.position = this.computeNextMovement(
        player,
        rotation,
      );

      if (
        this.jumpInitiated &&
        this.detectGround(rigidBody, collider, height)
      ) {
        this.jump(rigidBody);
      }
      this.jumpInitiated = false;

      if (this.attackInitiated && animationComponent) {
        this.attack(animationComponent);
      }
    }
  }

  private jump(rigidBody: RigidBody): void {
    rigidBody.applyImpulse(
      {
        x: 0,
        y: 100,
        z: 0,
      },
      true,
    );
  }

  private detectGround(
    rigidBody: RigidBody,
    collider: Collider,
    height: number,
  ): boolean {
    const position = rigidBody.translation();

    const hit = this.physicsManager.castRay(
      position,
      {
        x: 0.0,
        y: -1,
        z: 0.0,
      },
      height / 2 + 0.1, // get half the height of the body plus a small offset
      true,
      undefined,
      undefined,
      collider,
    );

    return !!hit?.collider;
  }

  private computeNextMovement(
    player: PlayerControlComponent,
    currentRotation: THREE.Quaternion,
  ): THREE.Vector3 {
    const { velocity, speed, accelerationFactor, decelerationRate } = player;

    const delta = this.timeManager.timeStep;
    velocity.lerp(new THREE.Vector3(0, 0, 0), decelerationRate * delta);

    // Compute movement direction
    const direction = new THREE.Vector3(
      Number(this.moveRight) - Number(this.moveLeft),
      0,
      Number(this.moveBackward) - Number(this.moveForward),
    );

    if (direction.lengthSq() > 0) {
      direction.normalize(); // Avoid diagonal speed boost

      // Apply acceleration
      velocity.addScaledVector(direction, speed * accelerationFactor * delta);

      // Clamp velocity to max speed
      const maxSpeed = speed * delta;
      if (velocity.length() > maxSpeed) {
        velocity.normalize().multiplyScalar(maxSpeed);
      }
    }

    return velocity.clone().applyQuaternion(currentRotation);
  }

  private setListeners(): void {
    document.addEventListener("keydown", this.handleKeyboardEvent);
    document.addEventListener("keyup", this.handleKeyboardEvent);
    document.addEventListener("click", this.handleClick);
  }

  private removeListeners(): void {
    document.removeEventListener("keydown", this.handleKeyboardEvent);
    document.removeEventListener("keyup", this.handleKeyboardEvent);
    document.removeEventListener("click", this.handleClick);
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
        this.accelerate = isKeyDown;
    }
  }

  private handleClick(): void {
    this.attackInitiated = true; // TODO: maybe create separate system PlayerAttackSystem
  }

  private attack(animationComponent: AnimationComponent): void {
    this.attackInitiated = false;

    const randomAttackAnimation =
      PlayerAnimations.ATTACKS[
        Math.floor(Math.random() * PlayerAnimations.ATTACKS.length)
      ];

    animationComponent.animation = randomAttackAnimation;
    animationComponent.completeHandler = () => {
      animationComponent.animation = PlayerAnimations.Idle;
    };
  }
}
