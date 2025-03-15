import { EnemyComponent } from "../components/EnemyComponent";
import { MakeDamageComponent } from "../components/MakeDamageComponent";
import { OwnerComponent } from "../components/OwnerComponent";
import { PlayerComponent } from "../components/PlayerComponent";
import { WeaponComponent } from "../components/WeaponComponent";
import { Entity } from "../models/Entity";
import { Constructor } from "../type-utils/constructor";

export type CollisionHandler = {
  requiredComponents1: Constructor[];
  requiredComponents2: Constructor[];
  handler: (entity1: Entity, entity2: Entity) => void;
};

export const COLLISION_HANDLERS: CollisionHandler[] = [
  {
    requiredComponents1: [EnemyComponent],
    requiredComponents2: [WeaponComponent, OwnerComponent],
    handler: (enemy: Entity, weapon: Entity) => {
      const { owner } = weapon.getComponent(OwnerComponent)!;
      const isPlayer = owner.hasComponent(PlayerComponent);

      if (isPlayer) {
        const { damageAmount } = weapon.getComponent(WeaponComponent)!;

        enemy.addComponent(new MakeDamageComponent(damageAmount));
      }
    },
  },
];
