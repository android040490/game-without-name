import type { Collider, RigidBody } from "@dimforge/rapier3d";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { TimeManager } from "../managers/TimeManager";
import { PhysicsManager } from "../managers/PhysicsManager";
import { PlayerControlComponent } from "../components/PlayerControlComponent";
import { PlayerConfigComponent } from "../components/PlayerConfigComponent";
import { DesktopInputManager } from "../managers/DesktopInputManager";
import {
  InputManager,
  InputManagerConfig,
  InputManagerEvents,
} from "../models/InputManager";
import { MobileInputManager } from "../managers/MobileInputManager";
import { isMobile } from "../../helpers";
import { MeshComponent } from "../components/MeshComponent";
import { Euler, Quaternion, Vector3 } from "three";
import { CameraComponent } from "../components/CameraComponent";
import { WeaponComponent } from "../components/WeaponComponent";
import {
  PlayerState,
  PlayerStateComponent,
} from "../components/PlayerStateComponent";
import { EventBus } from "../event/EventBus";
import { StateTransition } from "../event/StateTransition";

export class PlayerControlSystem extends System {
  private readonly eventBus: EventBus;
  private readonly timeManager: TimeManager;
  private readonly physicsManager: PhysicsManager;
  private inputManager: InputManager;
  private entity?: Entity;
  private _quaternion = new Quaternion();
  private _euler = new Euler(0, 0, 0, "YXZ");

  constructor(game: Game) {
    super(game);

    this.timeManager = game.timeManager;
    this.physicsManager = game.physicsManager;
    this.eventBus = game.eventBus;

    const inputManagerConfig: InputManagerConfig = {
      minPolarAngle: 0,
      maxPolarAngle: 2.8,
    };
    this.inputManager = isMobile()
      ? new MobileInputManager(inputManagerConfig)
      : new DesktopInputManager(inputManagerConfig);

    this.attack = this.attack.bind(this);
    this.jump = this.jump.bind(this);
    this.accelerate = this.accelerate.bind(this);
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
    this.entity = entity;

    this.inputManager.setup();

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
    const armsHolder = this.entity
      .getComponent(MeshComponent)
      ?.object.getObjectByName("ArmsHolder");

    if (!collider || !rigidBody || !rigidBody.isValid()) {
      return;
    }

    const onGround = this.detectGround(rigidBody, collider, height);
    playerControlComponent.onGround = onGround;

    this.computeNextVelocity(playerControlComponent, rigidBody, onGround);

    const pitch = this.inputManager.pitch;
    const yaw = this.inputManager.yaw;
    this._euler.set(pitch, yaw, 0);
    const rotation = this._quaternion.setFromEuler(this._euler);
    rigidBody?.setRotation({ x: 0, y: rotation.y, z: 0, w: rotation.w }, true);
    armsHolder?.rotation.set(pitch, 0, 0);
  }

  private jump(): void {
    const { rigidBody } = this.entity?.getComponent(PhysicsComponent) ?? {};
    const { onGround } = this.entity?.getComponent(PlayerControlComponent)!;

    if (!rigidBody || !onGround) {
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

    const currentSpeed = velocity.length();
    if (onTheGround && currentSpeed > 4) {
      this.eventBus.emit(new StateTransition(this.entity!, "run"));
    } else if (onTheGround && currentSpeed > 1) {
      this.eventBus.emit(new StateTransition(this.entity!, "move"));
    } else {
      this.eventBus.emit(new StateTransition(this.entity!, "stop"));
    }
  }

  private attack(): void {
    this.fire();
  }

  private fire(): void {
    const weapon = this.entity?.getComponent(WeaponComponent);
    const stateComponent = this.entity?.getComponent(PlayerStateComponent);
    if (!weapon) {
      return;
    }

    if (
      stateComponent?.currentState === PlayerState.Shoot ||
      stateComponent?.currentState === PlayerState.Reload
    ) {
      return;
    }

    const direction = new Vector3();
    this.entity
      ?.getComponent(CameraComponent)
      ?.camera.getWorldDirection(direction);

    weapon.isShotInitiated = true;
    weapon.direction = direction;
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
