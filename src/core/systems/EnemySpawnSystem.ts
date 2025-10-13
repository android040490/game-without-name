import * as THREE from "three";
import { CharacterMovementComponent } from "../components/CharacterMovementComponent";
import { EnemyComponent } from "../components/EnemyComponent";
import { PositionComponent } from "../components/PositionComponent";
import { RotationComponent } from "../components/RotationComponent";
import { Game } from "../Game";
import { EntityManager } from "../managers/EntityManager";
import { System } from "../models/System";
import { HealthComponent } from "../components/HealthComponent";
import {
  EnemyState,
  EnemyStateComponent,
} from "../components/EnemyStateComponent";
import { Renderer } from "../managers/Renderer";
import { CharacterBuilder } from "../factories/CharacterBuilder";
import { EnergyBarComponent } from "../components/EnergyBarComponent";

export class EnemySpawnSystem extends System {
  private readonly entityManager: EntityManager;
  private readonly characterBuilder: CharacterBuilder;
  private readonly render: Renderer;

  constructor(game: Game) {
    super(game);

    this.entityManager = game.entityManager;
    this.characterBuilder = game.characterBuilder;
    this.render = game.renderer;
  }

  update() {
    if (this.shouldSpawnEnemy()) {
      this.spawnEnemy();
    }
  }

  private shouldSpawnEnemy(): boolean {
    // TODO: add more complex logic
    return Math.random() < 0.002;
  }

  private async spawnEnemy() {
    const height = 2.3;
    const health = 30;
    const entity = await this.characterBuilder.createCharacter({
      modelPath: "models/zombie-cop.glb",
      density: 10,
      height,
    });
    const spawnPosition = this.getRandomSpawnPosition();
    entity.addComponent(new EnemyComponent());
    entity.addComponent(
      new PositionComponent(spawnPosition.x, spawnPosition.y, spawnPosition.z),
    );
    entity.addComponent(new RotationComponent(0, 0, 0, 1));
    entity.addComponent(new CharacterMovementComponent());
    entity.addComponent(new HealthComponent(health));
    entity.addComponent(new EnergyBarComponent(health, height / 2 + 0.1));
    entity.addComponent(new EnemyStateComponent(EnemyState.StandUp));
    this.entityManager.addEntity(entity);
  }

  private getRandomSpawnPosition(): THREE.Vector3 {
    const terrain = this.render.scene.getObjectByName("terrain");
    if (!terrain || !(terrain instanceof THREE.Mesh)) {
      return new THREE.Vector3(0, 9, 0);
    }

    const posAttr = terrain.geometry.attributes.position;
    const idx = Math.floor(Math.random() * posAttr.count);

    return new THREE.Vector3(
      posAttr.getX(idx),
      posAttr.getY(idx) + 1.5,
      posAttr.getZ(idx),
    );
  }
}
