import { EnergyBarComponent } from "../components/EnergyBarComponent";
import { HealthComponent } from "../components/HealthComponent";
import { MeshComponent } from "../components/MeshComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class EnergyBarSystem extends System {
  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(EnergyBarComponent, HealthComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);
    const meshComponent = entity.getComponent(MeshComponent);
    const energyBarComponent = entity.getComponent(EnergyBarComponent)!;

    if (meshComponent) {
      meshComponent.object.add(energyBarComponent.progressBar);
    }
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { initialHealth, health } = entity.getComponent(HealthComponent)!;
      const energyBarComponent = entity.getComponent(EnergyBarComponent)!;

      const ratio = health / initialHealth;
      energyBarComponent.progressBar.progress.value = ratio;
    }
  }
}
