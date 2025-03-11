import * as THREE from "three";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { MeshComponent } from "../components/MeshComponent";
import { EntityManager } from "../managers/EntityManager";
import { ResourcesManager } from "../managers/ResourcesManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { GLTF } from "three/examples/jsm/Addons.js";
import { AnimationComponent } from "../components/AnimationComponent";
import { MeshBuilder } from "../factories/MeshBuilder";
import { PlayerConfigComponent } from "../components/PlayerConfigComponent";

export class PlayerFactorySystem extends System {
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
    return entity.hasComponent(PlayerConfigComponent);
  }

  addEntity(entity: Entity): void {
    super.addEntity(entity);

    this.createPlayer(entity);
  }

  private async createPlayer(entity: Entity): Promise<void> {
    const { armsModelPath, height, isBoundingBoxVisible } = entity.getComponent(
      PlayerConfigComponent,
    )!;

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
        density: 10,
        rigidBodyType: "dynamic",
        lockRotation: true,
      }),
    ];

    model = await this.resourcesManager.loadModel(armsModelPath);

    if (model) {
      const armsMesh = this.prepareArmsModel(model);

      if (model.animations.length > 0) {
        components.push(
          new AnimationComponent(armsMesh, model.animations, "Idle"),
        );
      }

      console.log("model", armsMesh.getObjectByName("Proto_sword"));
      capsule.add(armsMesh);
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

  private prepareArmsModel(model: GLTF): THREE.Object3D {
    const modelMesh = model.scene;
    modelMesh.rotateY(Math.PI);
    modelMesh.scale.setScalar(0.4);
    modelMesh.position.y += 0.3;
    modelMesh.position.z -= 0.4;
    return modelMesh;
  }
}
