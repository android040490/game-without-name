import { HealthComponent } from "../components/HealthComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class DamageSystem extends System {
  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(HealthComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const healthComponent = entity.getComponent(HealthComponent)!;
      const { damage } = healthComponent;

      if (!damage) {
        continue;
      }

      healthComponent.health -= damage;
      healthComponent.damage = 0;
    }
  }
}
