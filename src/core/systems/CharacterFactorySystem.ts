import * as THREE from "three";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { MeshComponent } from "../components/MeshComponent";
import { EntityManager } from "../managers/EntityManager";
import { ResourcesManager } from "../managers/ResourcesManager";
import { CharacterConfigComponent } from "../components/CharacterConfigComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { GLTF, SkeletonUtils } from "three/examples/jsm/Addons.js";
import { AnimationComponent } from "../components/AnimationComponent";
import { MeshBuilder } from "../factories/MeshBuilder";

export class CharacterFactorySystem extends System {
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
    return entity.hasComponent(CharacterConfigComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity); // TODO: remove this, there is no point in storing entities in this system

    this.createCharacter(entity);
  }

  private async createCharacter(entity: Entity): Promise<void> {
    const { modelPath, height, density, isBoundingBoxVisible } =
      entity.getComponent(CharacterConfigComponent)!;

    let model: GLTF | undefined;

    const radius = height * 0.3;
    const capsuleLength = height - radius * 2;

    const capsule = this.createCapsule(
      radius,
      capsuleLength,
      isBoundingBoxVisible,
    );

    let components: object[] = [
      new MeshComponent(capsule),
      new PhysicsComponent({
        shape: { type: "capsule", height: capsuleLength, radius },
        density,
        rigidBodyType: "dynamic",
        lockRotation: true,
      }),
    ];

    if (modelPath) {
      model = await this.resourcesManager.loadModel(modelPath);
    }

    if (model) {
      const modelMesh = this.prepareModel(model, height);

      if (model.animations.length > 0) {
        components.push(new AnimationComponent(modelMesh, model.animations));
      }

      capsule.add(modelMesh);
    }

    this.entityManager.addComponents(entity, components);
  }

  private createCapsule(
    radius: number,
    capsuleLength: number,
    isBoundingBoxVisible: boolean,
  ): THREE.Mesh {
    return this.meshBuilder.createMesh({
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
  }

  private prepareModel(model: GLTF, height: number): THREE.Object3D {
    const modelMesh = SkeletonUtils.clone(model.scene);
    const box = new THREE.Box3().setFromObject(model.scene);
    const ratio = height / box.getSize(new THREE.Vector3()).y;
    modelMesh.scale.setScalar(ratio);
    modelMesh.position.y = -height / 2;
    return modelMesh;
  }
}
