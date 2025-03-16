import { EnemyComponent } from "../components/EnemyComponent";
import { MakeDamageComponent } from "../components/MakeDamageComponent";
import { OwnerComponent } from "../components/OwnerComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { WeaponComponent } from "../components/WeaponComponent";
import { Entity } from "../models/Entity";
import { Constructor } from "../type-utils/constructor";

export type CollisionForceHandler = {
  entity1Components: Constructor[];
  entity2Components: Constructor[];
  minimumForceThreshold: number;
  handler: (entity1: Entity, entity2: Entity, force: number) => void;
};

export const COLLISION_FORCE_HANDLERS: CollisionForceHandler[] = [
  {
    entity1Components: [EnemyComponent],
    entity2Components: [WeaponComponent, OwnerComponent],
    minimumForceThreshold: 500,
    handler: (enemy: Entity, weapon: Entity, force: number) => {
      const { owner } = weapon.getComponent(OwnerComponent)!;
      const isPlayer = owner.hasComponent(PlayerComponent);

      if (isPlayer) {
        const { damageAmount } = weapon.getComponent(WeaponComponent)!;
        const damage = damageAmount * (force / 100000);

        enemy.addComponent(new MakeDamageComponent(damage));
      }
    },
  },
];
