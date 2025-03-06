import * as THREE from "three";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { RenderComponent } from "../components/RenderComponent";
import { EntityManager } from "../managers/EntityManager";
import { ResourcesManager } from "../managers/ResourcesManager";
import { CharacterModelComponent } from "../components/CharacterModelComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { GLTF, SkeletonUtils } from "three/examples/jsm/Addons.js";
import { AnimationComponent } from "../components/AnimationComponent";
import { MeshBuilder } from "../factories/MeshBuilder";

export class CharacterModelSystem extends System {
  private readonly entityManager: EntityManager;
  private readonly resourcesManager: ResourcesManager;
  private readonly meshBuilder: MeshBuilder;

  constructor(game: Game) {
    super(game);

    this.entityManager = this.game.entityManager;
    this.resourcesManager = this.game.resourcesManager;
    this.meshBuilder = new MeshBuilder();
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(CharacterModelComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity); // TODO: remove this, there is no point in storing entities in this system

    this.createCharacter(entity);
  }

  async createCharacter(entity: Entity): Promise<void> {
    const {
      modelPath,
      height = 2,
      density = 10,
      isBoundingBoxVisible = false,
    } = entity.getComponent(CharacterModelComponent)!.config ?? {};

    let components: object[] = [];
    let model: GLTF | undefined;

    const radius = height * 0.3;
    const capsuleLength = height - radius * 2;
    const mesh = this.meshBuilder.createMesh({
      geometry: {
        type: "capsule",
        params: [radius, capsuleLength, 1, 3],
      },
      material: {
        type: "basic",
        params: {
          color: 0x00ff00,
          wireframe: true,
          visible: isBoundingBoxVisible,
        },
      },
    });

    if (modelPath) {
      model = await this.resourcesManager.loadModel(modelPath);
    }

    if (model) {
      const modelMesh = SkeletonUtils.clone(model.scene);
      const box = new THREE.Box3().setFromObject(model.scene);
      const boxSize = new THREE.Vector3();
      box.getSize(boxSize);
      const ratio = height / boxSize.y;
      modelMesh.scale.multiplyScalar(ratio);
      modelMesh.position.y = -height / 2;

      if (model.animations.length > 0) {
        components.push(new AnimationComponent(modelMesh, model.animations));
      }

      mesh.add(modelMesh);
    }

    components.push(
      new RenderComponent(mesh),
      new PhysicsComponent({
        shape: { type: "capsule", height: capsuleLength, radius },
        density,
        rigidBodyType: "dynamic",
        lockRotation: true,
      }),
    );

    this.entityManager.addComponents(entity, components);
  }
}
