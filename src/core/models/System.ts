import { Game } from "../Game";
import { Entity } from "./Entity";

export abstract class System {
  public readonly entities: Map<string, Entity> = new Map();
  public enabled = true;

  constructor(protected readonly game: Game) {}

  public abstract appliesTo(entity: Entity): boolean;

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entity: Entity): void {
    this.entities.delete(entity.id);
  }

  update(): void {}

  //   public initialize(game: Game): void {
  //     // Intentionally left empty
  //   }
}
