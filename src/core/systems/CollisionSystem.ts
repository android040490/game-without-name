import { Collider } from "@dimforge/rapier3d";
import { InteractionGroups } from "../constants/InteractionGroups";
import { Game } from "../Game";
import { PhysicsManager } from "../managers/PhysicsManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { PhysicsComponent } from "../components/PhysicsComponent";

export class CollisionSystem extends System {
  private readonly physicsManager: PhysicsManager;
  private colliderToEntityMap: Map<Collider, Entity> = new Map();

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
    this.registerCollider(entity, collider);
  }

  removeEntity(entity: Entity): void {
    super.removeEntity(entity);

    this.unregisterCollider(entity);
  }

  update(): void {
    this.physicsManager.eventQueue.drainCollisionEvents(
      (handle1, handle2, started) => {
        const collider1 = this.physicsManager.instance.getCollider(handle1);
        const collider2 = this.physicsManager.instance.getCollider(handle2);
        // console.log(
        //   collider1.collisionGroups() === InteractionGroups.PLAYER_WEAPON,
        //   this.physicsManager.instance
        //     .getCollider(handle2)
        //     .collisionGroups() === InteractionGroups.ENEMY,
        // );
        if (!collider1 || !collider2) {
          return;
        }

        console.log(
          this.getEntityByCollider(collider1),
          this.getEntityByCollider(collider2),
        );
      },
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
