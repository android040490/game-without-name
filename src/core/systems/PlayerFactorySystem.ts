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
import { WeaponComponent } from "../components/WeaponComponent";
import { ActiveEvents } from "@dimforge/rapier3d";
import { InteractionGroups } from "../constants/InteractionGroups";
import { WeaponAnchorComponent } from "../components/WeaponAnchorComponent";
import { MeshConfigComponent } from "../components/MeshConfigComponent";
import { OwnerComponent } from "../components/OwnerComponent";

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
        colliderConfig: {
          shape: { type: "capsule", height: capsuleLength, radius },
          density: 10,
          collisionGroups: InteractionGroups.PLAYER,
        },
        rigidBodyConfig: {
          rigidBodyType: "dynamic",
          lockRotation: true,
        },
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

      this.createWeapon(entity, armsMesh);

      capsule.add(armsMesh);
    }

    entity.addComponents(components);
  }

  private createWeapon(player: Entity, armsMesh: THREE.Object3D): void {
    const swordMesh = armsMesh.getObjectByName("Proto_sword");

    if (!swordMesh) {
      console.error("PlayerFactorySystem: arms model doesn't have sword");
      return;
    }

    const box = new THREE.Box3().setFromObject(swordMesh);
    const swordSize = box.getSize(new THREE.Vector3());

    const weapon = new Entity();
    weapon.addComponents([
      new OwnerComponent(player),
      new WeaponComponent({ damageAmount: 10 }),
      new WeaponAnchorComponent(swordMesh, new THREE.Vector3(-0.01, 0.5, 0)), // TODO: maybe could be a part of Player entity
      new PhysicsComponent({
        colliderConfig: {
          shape: {
            type: "box",
            sizes: { x: 0.05, y: swordSize.y, z: 0.05 },
          },
          activeEvents: ActiveEvents.COLLISION_EVENTS,
          collisionGroups: InteractionGroups.PLAYER_WEAPON,
        },
      }),
      new MeshConfigComponent({
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
      }),
    ]);

    this.entityManager.addEntity(weapon);
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
