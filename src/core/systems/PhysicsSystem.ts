import { System } from "../models/System";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { PositionComponent } from "../components/PositionComponent";
import { PhysicsManager } from "../managers/PhysicsManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { TimeManager } from "../managers/TimeManager";
import { RotationComponent } from "../components/RotationComponent";
import { EventBus } from "../event/EventBus";
import { PlayerPositionUpdated } from "../event/PlayerPositionUpdated";
import { PlayerComponent } from "../components/PlayerComponent";
import { CollisionManager } from "../managers/CollisionManager";

export class PhysicsSystem extends System {
  private readonly collisionManager: CollisionManager;
  private readonly physicsManager: PhysicsManager;
  private readonly timeManager: TimeManager;
  private readonly eventBus: EventBus;

  constructor(game: Game) {
    super(game);

    this.physicsManager = this.game.physicsManager;
    this.timeManager = this.game.timeManager;
    this.collisionManager = this.game.collisionManager;
    this.eventBus = game.eventBus;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(PhysicsComponent);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);
    const { rigidBody, collider } = entity.getComponent(PhysicsComponent) ?? {};

    if (collider) {
      this.physicsManager.removeCollider(collider);
      this.collisionManager.unregisterCollider(collider);
    }

    if (rigidBody) {
      this.physicsManager.removeRigidBody(rigidBody);
    }
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);
    const component = entity.getComponent(PhysicsComponent)!;
    const { config } = component;
    const { position } = entity.getComponent(PositionComponent) ?? {};
    const { rotation } = entity.getComponent(RotationComponent) ?? {};

    if (config.rigidBodyConfig) {
      config.rigidBodyConfig.position = position;
      config.rigidBodyConfig.rotation = rotation;
    }

    const { collider, rigidBody } = this.physicsManager.createObject(
      component.config,
    );
    component.collider = collider;
    component.rigidBody = rigidBody;

    this.collisionManager.registerCollider(entity, collider);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { rigidBody } = entity.getComponent(PhysicsComponent) ?? {};
      const { position } = entity.getComponent(PositionComponent) ?? {};
      const { rotation } = entity.getComponent(RotationComponent) ?? {};
      const isPlayer = entity.hasComponent(PlayerComponent);

      if (position && rigidBody) {
        const newPosition = rigidBody.translation();
        position.copy(newPosition);
      }

      if (rotation && rigidBody) {
        const newRotation = rigidBody.rotation();
        rotation.copy(newRotation);
      }

      if (position && isPlayer) {
        this.eventBus.emit(new PlayerPositionUpdated(position));
      }
    }

    this.physicsManager.update(this.timeManager.timeStep);
    this.collisionManager.checkCollisions();
  }
}
