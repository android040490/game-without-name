import { BulletComponent } from "../components/BulletComponent";
import { HealthComponent } from "../components/HealthComponent";
import { LifetimeComponent } from "../components/LifetimeComponent";
import { MakeDamageComponent } from "../components/MakeDamageComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Entity } from "../models/Entity";
import { Constructor } from "../type-utils/constructor";

export type CollisionHandler = {
  entity1Components: Constructor[];
  entity2Components: Constructor[];
  handler: (entity1: Entity, entity2: Entity) => void;
};

export const COLLISION_HANDLERS: CollisionHandler[] = [
  {
    entity1Components: [],
    entity2Components: [BulletComponent],
    handler: (hitEntity: Entity, bullet: Entity) => {
      const physicsComponent = hitEntity.getComponent(PhysicsComponent);
      const bulletLifeTime = bullet.getComponent(LifetimeComponent);

      if (
        bulletLifeTime &&
        !physicsComponent?.collider?.isSensor() &&
        !hitEntity.hasComponent(BulletComponent)
      ) {
        bulletLifeTime.timeLeft = 0.05;
      }

      if (hitEntity.hasComponent(HealthComponent)) {
        const { damage } = bullet.getComponent(BulletComponent)!;
        const makeDamage = hitEntity.getComponent(MakeDamageComponent);

        makeDamage
          ? (makeDamage.damage += damage)
          : hitEntity.addComponent(new MakeDamageComponent(damage));
      }
    },
  },
];
