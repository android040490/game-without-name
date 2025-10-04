import { BulletComponent } from "../components/BulletComponent";
import { HealthComponent } from "../components/HealthComponent";
import { LifetimeComponent } from "../components/LifetimeComponent";
import { MakeDamageComponent } from "../components/MakeDamageComponent";
import { Entity } from "../models/Entity";
import { InteractionGroups as IG } from "./InteractionGroups";

export type CollisionHandler = (entity1: Entity, entity2: Entity) => void;

export const COLLISION_HANDLERS: Record<string, CollisionHandler | undefined> =
  {
    [`${IG.HURT_BOX}:${IG.PROJECTILE}`]: (
      hitEntity: Entity,
      bullet: Entity,
    ) => {
      const bulletComponent = bullet.getComponent(BulletComponent);
      if (!bulletComponent) {
        return;
      }

      const bulletLifeTime = bullet.getComponent(LifetimeComponent);

      if (bulletLifeTime) {
        bulletLifeTime.timeLeft = 0;
      }

      if (hitEntity.hasComponent(HealthComponent)) {
        const { damage } = bulletComponent;
        const makeDamage = hitEntity.getComponent(MakeDamageComponent);

        makeDamage
          ? (makeDamage.damage += damage)
          : hitEntity.addComponent(new MakeDamageComponent(damage));
      }
    },
  };
