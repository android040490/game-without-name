import { Collider } from "@dimforge/rapier3d";
import { Game } from "../Game";
import { PhysicsManager } from "../managers/PhysicsManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Constructor } from "../type-utils/constructor";
import {
  COLLISION_HANDLERS,
  CollisionHandler,
} from "../constants/CollisionHandlers";
import { EntityManager } from "../managers/EntityManager";

export class CollisionSystem extends System {
  private readonly physicsManager: PhysicsManager;
  private readonly entityManager: EntityManager;
  private colliderToEntityMap: Map<Collider, Entity> = new Map();

  constructor(game: Game) {
    super(game);

    this.physicsManager = this.game.physicsManager;
    this.entityManager = this.game.entityManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(PhysicsComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);

    const collider = entity.getComponent(PhysicsComponent)!.collider;
    if (!collider) {
      console.error("CollisionSystem: PhysicsComponent doesn't have collider");
      return;
    }
    this.registerCollider(entity, collider);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);

    this.unregisterCollider(entity);
  }

  update(): void {
    this.physicsManager.eventQueue.drainCollisionEvents(
      (handle1, handle2, started) => {
        if (!started) {
          return;
        }

        const collider1 = this.physicsManager.instance.getCollider(handle1);
        const collider2 = this.physicsManager.instance.getCollider(handle2);

        if (!collider1 || !collider2) {
          return;
        }

        const entity1 = this.getEntityByCollider(collider1);
        const entity2 = this.getEntityByCollider(collider2);

        if (!entity1 || !entity2) {
          return;
        }

        for (const collisionHandler of COLLISION_HANDLERS) {
          this.handleCollision(entity1, entity2, collisionHandler);
        }
      },
    );
  }

  private handleCollision(
    entity1: Entity,
    entity2: Entity,
    collisionHandler: CollisionHandler,
  ) {
    const { requiredComponents1, requiredComponents2, handler } =
      collisionHandler;

    if (
      this.isMatch(entity1, entity2, requiredComponents1, requiredComponents2)
    ) {
      handler(entity1, entity2, this.entityManager);
    } else if (
      this.isMatch(entity2, entity1, requiredComponents1, requiredComponents2)
    ) {
      handler(entity2, entity1, this.entityManager);
    }
  }

  private isMatch(
    entity1: Entity,
    entity2: Entity,
    requiredComponents1: Constructor[],
    requiredComponents2: Constructor[],
  ): boolean {
    return (
      entity1.hasComponents(...requiredComponents1) &&
      entity2.hasComponents(...requiredComponents2)
    );
  }

  private registerCollider(entity: Entity, collider: Collider) {
    this.colliderToEntityMap.set(collider, entity);
  }

  private unregisterCollider(entity: Entity) {
    const collider = entity.getComponent(PhysicsComponent)!.collider;

    if (collider) {
      this.colliderToEntityMap.delete(collider);
    }
  }

  private getEntityByCollider(collider: Collider): Entity | null {
    return this.colliderToEntityMap.get(collider) || null;
  }
}
