import type { Collider, RigidBody } from "@dimforge/rapier3d";
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
import { DesktopInputManager } from "../managers/DesktopInputManager";
import { InputManager, InputManagerEvents } from "../models/InputManager";
import { CameraComponent } from "../components/CameraComponent";
import { MobileInputManager } from "../managers/MobileInputManager";
import { isMobile } from "../../helpers";

export class PlayerControlSystem extends System {
  private readonly timeManager: TimeManager;
  private readonly physicsManager: PhysicsManager;
  private inputManager: InputManager;
  private onGround: boolean = false;
  private entity?: Entity;

  constructor(game: Game) {
    super(game);

    this.timeManager = game.timeManager;
    this.physicsManager = game.physicsManager;
    this.inputManager = isMobile()
      ? new MobileInputManager()
      : new DesktopInputManager(game);

    this.attack = this.attack.bind(this);
    this.jump = this.jump.bind(this);
    this.accelerate = this.accelerate.bind(this);
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      PlayerControlComponent,
      PlayerConfigComponent,
      PhysicsComponent,
      CameraComponent,
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
    this.entity = entity;

    const cameraComponent = entity.getComponent(CameraComponent)!;
    this.inputManager.setup(cameraComponent.camera);

    this.inputManager.addEventListener("attack", this.attack);
    this.inputManager.addEventListener("jump", this.jump);
    this.inputManager.addEventListener("accelerate", this.accelerate);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    this.inputManager.dispose();

    this.inputManager.removeEventListener("attack", this.attack);
    this.inputManager.removeEventListener("jump", this.jump);
    this.inputManager.removeEventListener("accelerate", this.accelerate);
  }

  update(): void {
    if (!this.entity) {
      return;
    }
    const { rigidBody, collider } = this.entity.getComponent(PhysicsComponent)!;
    const { height } = this.entity.getComponent(PlayerConfigComponent)!;
    const playerControlComponent = this.entity.getComponent(
      PlayerControlComponent,
    )!;
    const { camera } = this.entity.getComponent(CameraComponent)!;

    if (!collider || !rigidBody) {
      return;
    }

    this.onGround = this.detectGround(rigidBody, collider, height);

    this.computeNextVelocity(playerControlComponent, rigidBody, this.onGround);

    const { y, w } = camera.quaternion;
    rigidBody?.setRotation({ x: 0, y, z: 0, w }, true);
  }

  private jump(): void {
    const { rigidBody } = this.entity?.getComponent(PhysicsComponent) ?? {};

    if (!rigidBody || !this.onGround) {
      return;
    }

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
    const direction = this.inputManager.playerLocalMovementDirection;

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

  private attack(): void {
    const animationComponent = this.entity?.getComponent(AnimationComponent);
    if (!animationComponent) {
      return;
    }

    const randomAttackAnimation =
      PlayerAnimations.ATTACKS[
        Math.floor(Math.random() * PlayerAnimations.ATTACKS.length)
      ];

    animationComponent.animation = randomAttackAnimation;
    animationComponent.completeHandler = () => {
      animationComponent.animation = PlayerAnimations.Idle;
    };
  }

  private accelerate(event: InputManagerEvents["accelerate"]): void {
    const playerControlComponent = this.entity?.getComponent(
      PlayerControlComponent,
    );

    if (!playerControlComponent) {
      return;
    }

    playerControlComponent.speed = event.value
      ? playerControlComponent.maxSpeed
      : playerControlComponent.minSpeed;
  }
}
