import { DeadMarkerComponent } from "../components/DeadMarkerComponent";
import { HealthComponent } from "../components/HealthComponent";
import { MakeDamageComponent } from "../components/MakeDamageComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class DamageSystem extends System {
  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(HealthComponent, MakeDamageComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const healthComponent = entity.getComponent(HealthComponent)!;
      const { amount } = entity.getComponent(MakeDamageComponent)!;

      healthComponent.health -= amount;

      if (healthComponent.health <= 0) {
        entity.addComponent(new DeadMarkerComponent());
      }

      entity.removeComponent(MakeDamageComponent);
    }
  }
}
