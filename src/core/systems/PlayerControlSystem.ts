import type { Collider, RigidBody } from "@dimforge/rapier3d";
import * as THREE from "three";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { TimeManager } from "../managers/TimeManager";
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
      PlayerConfigComponent,
      PhysicsComponent,
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
      const { height } = entity.getComponent(PlayerConfigComponent)!;
      const playerControlComponent = entity.getComponent(
        PlayerControlComponent,
      )!;

      if (!collider || !rigidBody) {
        continue;
      }

      playerControlComponent.accelerate = this.accelerate;

      const onTheGround = this.detectGround(rigidBody, collider, height);

      this.computeNextVelocity(playerControlComponent, rigidBody, onTheGround);

      if (this.jumpInitiated && onTheGround) {
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
    const hitShape = this.physicsManager.castShape({
      position: rigidBody.translation(),
      rotation: rigidBody.rotation(),
      direction: { x: 0, y: -1, z: 0 },
      shapeConfig: {
        type: "cylinder",
        height,
        radius: 0.3,
      },
      targetDistance: 0,
      maxToi: 0.1,
      filterExcludeCollider: collider,
    });

    return !!hitShape;
  }

  private computeNextVelocity(
    playerControlComponent: PlayerControlComponent,
    rigidBody: RigidBody,
    onTheGround: boolean,
  ): void {
    const { velocity, speed, acceleration, damping } = playerControlComponent;

    const delta = this.timeManager.timeStep;

    // Compute movement direction
    const direction = new THREE.Vector3(
      Number(this.moveRight) - Number(this.moveLeft),
      0,
      Number(this.moveBackward) - Number(this.moveForward),
    );

    if (direction.lengthSq() > 0 && onTheGround) {
      direction.normalize(); // Avoid diagonal speed boost

      // Apply acceleration
      velocity.addScaledVector(direction, acceleration * delta);

      // Clamp velocity to max speed
      if (velocity.length() > speed) {
        velocity.setLength(speed);
      }
    } else if (velocity.lengthSq() > 0) {
      const dampingFactor = onTheGround ? damping : damping * 0.1; // Less damping in the air
      const factor = Math.pow(1 - dampingFactor, delta * 60);
      velocity.multiplyScalar(factor);

      // If the velocity is very small, set it to zero
      if (velocity.length() < 0.0001) {
        console.log("Resetting velocity to zero");
        velocity.set(0, 0, 0);
      }
    }

    if (onTheGround) {
      const currentRotation = rigidBody.rotation();
      const result = velocity.clone().applyQuaternion(currentRotation);
      result.y = rigidBody.linvel().y; // Preserve vertical velocity
      rigidBody.setLinvel(result, true);
    }
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
