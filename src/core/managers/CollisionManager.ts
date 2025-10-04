import type { Collider } from "@dimforge/rapier3d";
import { PhysicsManager } from "../managers/PhysicsManager";
import { Entity } from "../models/Entity";
import { Constructor } from "../type-utils/constructor";
import {
  COLLISION_HANDLERS,
  CollisionHandler,
} from "../constants/CollisionHandlers";
import {
  COLLISION_FORCE_HANDLERS,
  CollisionForceHandler,
} from "../constants/CollisionForceHandlers";

export class CollisionManager {
  private readonly physicsManager: PhysicsManager;
  private colliderToEntityMap: Map<number, Entity> = new Map();

  constructor(physicsManager: PhysicsManager) {
    this.physicsManager = physicsManager;
  }

  registerCollider(entity: Entity, collider: Collider) {
    this.colliderToEntityMap.set(collider.handle, entity);
  }

  unregisterCollider(collider: Collider) {
    this.colliderToEntityMap.delete(collider.handle);
  }

  checkCollisions(): void {
    this.physicsManager.eventQueue.drainContactForceEvents((event) => {
      const handle1 = event.collider1();
      const handle2 = event.collider2();
      const force = event.maxForceMagnitude();

      const entity1 = this.getEntityByColliderId(handle1);
      const entity2 = this.getEntityByColliderId(handle2);

      if (!entity1 || !entity2) {
        return;
      }

      // TODO: update handleContactForces to use the same approach as handleCollision
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

        this.handleCollision(handle1, handle2);
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

  private handleCollision(handle1: number, handle2: number) {
    const entity1 = this.getEntityByColliderId(handle1);
    const entity2 = this.getEntityByColliderId(handle2);

    if (!entity1 || !entity2) {
      return;
    }

    const collisionGroup1 =
      this.physicsManager.getCollisionGroupsByHandle(handle1);
    const collisionGroup2 =
      this.physicsManager.getCollisionGroupsByHandle(handle2);

    let handler = this.getCollisionHandler(collisionGroup1, collisionGroup2);
    if (handler) {
      handler(entity1, entity2);
      return;
    }

    handler = this.getCollisionHandler(collisionGroup2, collisionGroup1);
    if (handler) {
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

  private getEntityByColliderId(colliderId: number): Entity | null {
    return this.colliderToEntityMap.get(colliderId) || null;
  }

  private getCollisionHandler(
    collisionGroup1: number,
    collisionGroup2: number,
  ): CollisionHandler | undefined {
    return COLLISION_HANDLERS[`${collisionGroup1}:${collisionGroup2}`];
  }
}
