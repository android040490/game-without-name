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
import { PhysicsManager } from "../managers/PhysicsManager";
import { Renderer } from "../managers/Renderer";
import { PlayerWeaponComponent } from "../components/PlayerWeaponComponent";
import { ActiveEvents } from "@dimforge/rapier3d";

export class PlayerFactorySystem extends System {
  private readonly entityManager: EntityManager;
  private readonly resourcesManager: ResourcesManager;
  private readonly meshBuilder: MeshBuilder;
  private readonly physicsManager: PhysicsManager;
  private readonly renderer: Renderer;

  constructor(game: Game) {
    super(game);

    this.entityManager = this.game.entityManager;
    this.resourcesManager = this.game.resourcesManager;
    this.physicsManager = this.game.physicsManager;
    this.renderer = this.game.renderer;
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

      const weaponComponent = this.createWeaponComponent(armsMesh);

      if (weaponComponent) {
        components.push(weaponComponent);
      }

      capsule.add(armsMesh);
    }

    this.entityManager.addComponents(entity, components);
  }

  private createWeaponComponent(
    armsMesh: THREE.Object3D,
  ): PlayerWeaponComponent | undefined {
    const swordMesh = armsMesh.getObjectByName("Proto_sword");

    if (!swordMesh) {
      console.error("Arms model doesn't have sword");
      return;
    }

    const box = new THREE.Box3().setFromObject(swordMesh);
    const swordSize = box.getSize(new THREE.Vector3());

    const collider = this.physicsManager.createCollider({
      shape: {
        type: "box",
        sizes: { x: 0.05, y: swordSize.y, z: 0.05 },
      },
      sensor: true,
      activeEvents: ActiveEvents.COLLISION_EVENTS,
    });

    const debugMesh = this.meshBuilder.createMesh({
      geometry: {
        type: "box",
        params: [0.05, swordSize.y, 0.05],
      },
      material: {
        type: "basic",
        params: {
          color: 0x00ff00,
          wireframe: true,
        },
      },
    });
    this.renderer.scene.add(debugMesh);

    return new PlayerWeaponComponent(swordMesh, collider, debugMesh);
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
