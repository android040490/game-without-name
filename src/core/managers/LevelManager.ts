import { Game } from "../Game";

export class LevelManager {
  constructor(private readonly game: Game) {}

  async loadLevel(levelId: string): Promise<void> {
    const levelPath = `levels/${levelId}.json`;
    const { entities, jointData } = await this.game.levelParser.parseLevel(
      levelPath,
    );

    for (const entity of entities) {
      this.game.entityManager.addEntity(entity);
    }
    for (const joint of jointData) {
      this.game.jointManager.addJoint(joint);
    }
  }
}
