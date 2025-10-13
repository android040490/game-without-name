import * as THREE from "three";
import { Game } from "../Game";
import { MeshComponent } from "../components/MeshComponent";
import { ResourcesManager } from "../managers/ResourcesManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { GLTF, SkeletonUtils } from "three/examples/jsm/Addons.js";
import { AnimationComponent } from "../components/AnimationComponent";
import { MeshBuilder } from "./MeshBuilder";
import { InteractionGroups } from "../constants/InteractionGroups";
import { Entity } from "../models/Entity";

export interface CharacterConfig {
  modelPath?: string;
  height?: number;
  density?: number;
  isBoundingBoxVisible?: boolean;
}

export class CharacterBuilder {
  private readonly resourcesManager: ResourcesManager;
  private readonly meshBuilder: MeshBuilder;

  constructor(game: Game) {
    this.resourcesManager = game.resourcesManager;
    this.meshBuilder = new MeshBuilder();
  }

  async createCharacter(config: CharacterConfig): Promise<Entity> {
    const {
      modelPath,
      height = 2,
      density = 10,
      isBoundingBoxVisible = false,
    } = config;

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
        colliderConfig: {
          shape: { type: "capsule", height: capsuleLength, radius },
          density,
          collisionGroups: InteractionGroups.BOUNDING_BOX,
        },
        rigidBodyConfig: {
          rigidBodyType: "dynamic",
          lockRotation: true,
        },
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

    capsule.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.frustumCulled = false;
      }
    });

    const entity = new Entity();
    entity.addComponents(components);

    return entity;
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
