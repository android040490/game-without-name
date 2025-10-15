import { Game } from "../Game";
import { Entity } from "./Entity";

export abstract class System {
  public readonly entities: Map<string, Entity> = new Map();
  public enabled = true;

  constructor(protected readonly game: Game) {}

  appliesTo(_: Entity): boolean {
    // should be overridden in a specific system if necessary
    return false;
  }

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entity: Entity): void {
    this.entities.delete(entity.id);
  }

  update(_elapsed: number): void {
    // should be overridden in a specific system if necessary
  }

  //   public initialize(game: Game): void {
  //     // Intentionally left empty
  //   }
}
