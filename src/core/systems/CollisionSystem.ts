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
import {
  COLLISION_FORCE_HANDLERS,
  CollisionForceHandler,
} from "../constants/CollisionForceHandlers";

export class CollisionSystem extends System {
  private readonly physicsManager: PhysicsManager;
  private colliderToEntityMap: Map<number, Entity> = new Map();

  constructor(game: Game) {
    super(game);

    this.physicsManager = this.game.physicsManager;
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
    this.registerCollider(entity, collider.handle);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);

    this.unregisterCollider(entity);
  }

  update(): void {
    this.physicsManager.eventQueue.drainContactForceEvents((event) => {
      const handle1 = event.collider1();
      const handle2 = event.collider2();
      const force = event.maxForceMagnitude();

      const entity1 = this.getEntityByColliderId(handle1);
      const entity2 = this.getEntityByColliderId(handle2);

      if (!entity1 || !entity2) {
        return;
      }

      for (const collisionForceHandler of COLLISION_FORCE_HANDLERS) {
        this.handleContactForces(
          entity1,
          entity2,
          force,
          collisionForceHandler,
        );
      }
    });

    this.physicsManager.eventQueue.drainCollisionEvents(
      (handle1, handle2, started) => {
        if (!started) {
          return;
        }

        const entity1 = this.getEntityByColliderId(handle1);
        const entity2 = this.getEntityByColliderId(handle2);

        if (!entity1 || !entity2) {
          return;
        }

        for (const collisionHandler of COLLISION_HANDLERS) {
          this.handleCollision(entity1, entity2, collisionHandler);
        }
      },
    );
  }

  private handleContactForces(
    entity1: Entity,
    entity2: Entity,
    force: number,
    collisionHandler: CollisionForceHandler,
  ) {
    const {
      entity1Components,
      entity2Components,
      minimumForceThreshold,
      handler,
    } = collisionHandler;

    if (force < minimumForceThreshold) {
      return;
    }

    if (this.isMatch(entity1, entity2, entity1Components, entity2Components)) {
      handler(entity1, entity2, force);
    } else if (
      this.isMatch(entity2, entity1, entity1Components, entity2Components)
    ) {
      handler(entity2, entity1, force);
    }
  }

  private handleCollision(
    entity1: Entity,
    entity2: Entity,
    collisionHandler: CollisionHandler,
  ) {
    const { entity1Components, entity2Components, handler } = collisionHandler;

    if (this.isMatch(entity1, entity2, entity1Components, entity2Components)) {
      handler(entity1, entity2);
    } else if (
      this.isMatch(entity2, entity1, entity1Components, entity2Components)
    ) {
      handler(entity2, entity1);
    }
  }

  private isMatch(
    entity1: Entity,
    entity2: Entity,
    entity1Components: Constructor[],
    entity2Components: Constructor[],
  ): boolean {
    return (
      entity1.hasComponents(...entity1Components) &&
      entity2.hasComponents(...entity2Components)
    );
  }

  private registerCollider(entity: Entity, colliderId: number) {
    this.colliderToEntityMap.set(colliderId, entity);
  }

  private unregisterCollider(entity: Entity) {
    const collider = entity.getComponent(PhysicsComponent)!.collider;

    if (collider?.handle) {
      this.colliderToEntityMap.delete(collider.handle);
    }
  }

  private getEntityByColliderId(colliderId: number): Entity | null {
    return this.colliderToEntityMap.get(colliderId) || null;
  }
}
