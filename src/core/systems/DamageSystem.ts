const { RigidBodyType } = await import("@dimforge/rapier3d");
import { DamagedMarkerComponent } from "../components/DamagedMarkerComponent";
import { DeadMarkerComponent } from "../components/DeadMarkerComponent";
import { HealthComponent } from "../components/HealthComponent";
import { MakeDamageComponent } from "../components/MakeDamageComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";

export class DamageSystem extends System {
  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(HealthComponent, MakeDamageComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const healthComponent = entity.getComponent(HealthComponent)!;
      const { damage } = entity.getComponent(MakeDamageComponent)!;

      healthComponent.health -= damage;

      if (healthComponent.health <= 0) {
        this.markAsDead(entity);
      }

      entity.addComponent(new DamagedMarkerComponent());
      entity.removeComponent(MakeDamageComponent);
    }
  }

  private markAsDead(entity: Entity) {
    const { rigidBody, collider } = entity.getComponent(PhysicsComponent) ?? {};

    rigidBody?.setBodyType(RigidBodyType.KinematicPositionBased, true);
    collider?.setSensor(true);

    entity.addComponent(new DeadMarkerComponent());
  }
}
