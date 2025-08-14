import { Game } from "../Game";
import { EntityManager } from "./EntityManager";
import { LevelParser } from "./LevelParser";

export class LevelManager {
  private readonly entityManager: EntityManager;
  private readonly levelParser: LevelParser;

  constructor(game: Game) {
    this.entityManager = game.entityManager;
    this.levelParser = new LevelParser(game.resourcesManager);
  }

  async loadLevel(levelId: string): Promise<void> {
    const levelPath = `levels/${levelId}.json`;
    const entities = await this.levelParser.parseLevel(levelPath);

    for (const entity of entities) {
      this.entityManager.addEntity(entity);
    }
  }
}
