import { MeshConfigComponent } from "../components/MeshConfigComponent";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { MeshComponent } from "../components/MeshComponent";
import { EntityManager } from "../managers/EntityManager";
import {
  MeshBuilder,
  MeshConfig,
  TextureKey,
  TextureMap,
} from "../factories/MeshBuilder";
import { ResourcesManager } from "../managers/ResourcesManager";
import { TextureComponent } from "../components/TextureComponent";

export class MeshFactorySystem extends System {
  private readonly entityManager: EntityManager;
  private readonly meshBuilder: MeshBuilder;
  private readonly resourcesManager: ResourcesManager;

  constructor(game: Game) {
    super(game);

    this.entityManager = this.game.entityManager;
    this.resourcesManager = this.game.resourcesManager;
    this.meshBuilder = new MeshBuilder();
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(MeshConfigComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);

    const { config } = entity.getComponent(MeshConfigComponent) ?? {};
    if (!config) {
      return;
    }

    this.createMesh(entity, config);
  }

  private async createMesh(entity: Entity, config: MeshConfig): Promise<void> {
    const textureComponent = entity.getComponent(TextureComponent);

    if (textureComponent) {
      await this.setTexture(config, textureComponent);
    }
    const mesh = this.meshBuilder.createMesh(config);

    this.entityManager.addComponent(entity, new MeshComponent(mesh));
  }

  private async setTexture(
    config: MeshConfig,
    textureComponent: TextureComponent,
  ): Promise<void> {
    const { texturePaths, useCache, colorSpace, wrapS, wrapT, repeat } =
      textureComponent;

    let textureMap: TextureMap = {};
    const textures = Object.entries(texturePaths).map(async ([key, path]) => {
      const texture = await this.resourcesManager.loadTexture(path, useCache);
      if (!texture) {
        return;
      }
      if (key === "map") {
        texture.colorSpace = colorSpace;
      }
      texture.repeat = repeat;
      texture.wrapS = wrapS;
      texture.wrapT = wrapT;
      textureMap[key as TextureKey] = texture;
    });
    await Promise.all(textures);

    config.material.params = {
      ...config.material.params,
      ...textureMap,
    };
  }
}
