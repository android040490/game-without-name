import { v4 as uuidv4 } from "uuid";
import { Constructor } from "../type-utils/constructor";
import eventBus, { EventBus } from "../event/EventBus";
import { EntityUpdated } from "../event/EntityUpdated";

export class Entity {
  private readonly components = new Map<
    Constructor["name"],
    InstanceType<Constructor>
  >();
  private readonly eventBus: EventBus;

  id: string;
  isAdded: boolean = false;

  constructor() {
    this.id = uuidv4();

    this.eventBus = eventBus;
  }

  public getComponent<T>(componentType: Constructor<T>): T | undefined {
    return this.components.get(componentType.name) as T;
  }

  public addComponent(component: object): void {
    if (this.components.has(component.constructor.name)) {
      console.warn(
        `Component of type ${component.constructor.name} already exists in the entity.`,
      );
      return;
    }
    this.components.set(component.constructor.name, component);
    this.notifyAboutUpdate();
  }

  public addComponents(components: object[]): void {
    for (const component of components) {
      this.components.set(component.constructor.name, component);
    }
    this.notifyAboutUpdate();
  }

  public removeComponent(componentType: Constructor<any>): void {
    this.components.delete(componentType.name);
    this.notifyAboutUpdate();
  }

  public hasComponent(componentType: Constructor<any>): boolean {
    return this.components.has(componentType.name);
  }

  public hasComponents(...componentTypes: Constructor<any>[]): boolean {
    return componentTypes.every((componentType) =>
      this.hasComponent(componentType),
    );
  }

  private notifyAboutUpdate(): void {
    if (this.isAdded) {
      this.eventBus.emit(new EntityUpdated(this));
    }
  }
}
