import { BulletComponent } from "../components/BulletComponent";
import {
  EnemyState,
  EnemyStateComponent,
} from "../components/EnemyStateComponent";
import { HealthComponent } from "../components/HealthComponent";
import { LifetimeComponent } from "../components/LifetimeComponent";
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

      const health = hitEntity.getComponent(HealthComponent);
      if (health) {
        const { damage } = bulletComponent;
        health.damage += damage;
      }
    },
    [`${IG.HIT_BOX}:${IG.PLAYER}`]: (attacker: Entity, player: Entity) => {
      const { currentState } = attacker.getComponent(EnemyStateComponent) ?? {};
      const playerHealth = player.getComponent(HealthComponent);

      if (currentState === EnemyState.Attack && playerHealth) {
        const damage = 1;
        playerHealth.damage += damage;
      }
    },
  };
