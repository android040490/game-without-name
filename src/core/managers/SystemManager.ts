import { EntityUpdated } from "../event/EntityUpdated";
import { EntityAdded } from "../event/EntityAdded";
import { EntityRemoved } from "../event/EntityRemoved";
import eventBus, { EventBus } from "../event/EventBus";
import { System } from "../models/System";
import { Entity } from "../models/Entity";
import { Constructor } from "../type-utils/constructor";

export class SystemManager {
  private readonly eventBus: EventBus;
  private systems: System[];

  constructor() {
    this.systems = [];

    this.eventBus = eventBus;

    this.setListeners();
  }

  getSystem<T extends System>(systemClass: Constructor<T>): T | undefined {
    return this.systems.find((s) => s instanceof systemClass) as T;
  }

  addSystem(system: System) {
    this.systems.push(system);
  }

  update() {
    for (const system of this.systems) {
      if (system.enabled) {
        system.update();
      }
    }
  }

  private setListeners(): void {
    this.eventBus.on(EntityAdded, (event: EntityAdded) => {
      this.handleEntityAdded(event.entity);
    });
    this.eventBus.on(EntityUpdated, (event: EntityUpdated) => {
      this.handleEntityUpdated(event.entity);
    });
    this.eventBus.on(EntityRemoved, (event: EntityRemoved) => {
      this.handleEntityRemoved(event.entity);
    });
  }

  private handleEntityAdded(entity: Entity): void {
    for (const system of this.systems) {
      if (system.appliesTo(entity) && !system.entities.has(entity.id)) {
        system.addEntity(entity);
      }
    }
  }

  private handleEntityUpdated(entity: Entity): void {
    for (const system of this.systems) {
      const hasEntity = system.entities.has(entity.id);
      const applicable = system.appliesTo(entity);

      if (applicable && !hasEntity) {
        system.addEntity(entity);
      } else if (!applicable && hasEntity) {
        system.removeEntity(entity);
      }
    }
  }

  private handleEntityRemoved(entity: Entity): void {
    for (const system of this.systems) {
      if (system.appliesTo(entity)) {
        system.removeEntity(entity);
      }
    }
  }
}
