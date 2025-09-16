import * as THREE from "three";
import { Game } from "../Game";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { MeshComponent } from "../components/MeshComponent";
import { ResourcesManager } from "../managers/ResourcesManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { GLTF } from "three/examples/jsm/Addons.js";
import { AnimationComponent } from "../components/AnimationComponent";
import { MeshBuilder } from "../factories/MeshBuilder";
import { PlayerConfigComponent } from "../components/PlayerConfigComponent";
import { WeaponComponent } from "../components/WeaponComponent";
import { InteractionGroups } from "../constants/InteractionGroups";
import { CameraComponent } from "../components/CameraComponent";
import {
  PlayerState,
  PlayerStateComponent,
} from "../components/PlayerStateComponent";

export class PlayerFactorySystem extends System {
  private readonly resourcesManager: ResourcesManager;
  private readonly meshBuilder: MeshBuilder;

  constructor(game: Game) {
    super(game);

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
    const armsHolder = new THREE.Group();
    armsHolder.name = "ArmsHolder";
    armsHolder.position.y = height * 0.5 - 0.3;
    capsule.add(armsHolder);

    let components: object[] = [
      new CameraComponent({ cameraHolder: armsHolder }),
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
      new WeaponComponent({
        name: "Remington 870",
        type: "ranged",
        damage: 2,
        range: 100,
        fireRate: 1,
        bulletCount: 10,
        bulletSize: 0.02,
        bulletDensity: 40,
        bulletSpread: 0.07,
        projectileSpeed: 400,
        lastAttackTime: 0,
      }),
      new PlayerStateComponent(PlayerState.Idle),
    ];

    model = await this.resourcesManager.loadModel(armsModelPath);

    if (model) {
      const armsMesh = this.prepareArmsModel(model);

      if (model.animations.length > 0) {
        components.push(
          new AnimationComponent(armsMesh, model.animations, "Remington_Idle"),
        );
      }

      // this.createWeapon(entity, armsMesh);

      armsMesh.position.y -= 0.3;
      armsMesh.position.z -= 0.15;
      armsHolder.add(armsMesh);
    }

    entity.addComponents(components);
  }

  // Unused logic for legacy arms model with sword
  // private createWeapon(player: Entity, armsMesh: THREE.Object3D): void {
  //   const swordMesh = armsMesh.getObjectByName("Proto_sword");

  //   if (!swordMesh) {
  //     console.error("PlayerFactorySystem: arms model doesn't have sword");
  //     return;
  //   }

  //   const box = new THREE.Box3().setFromObject(swordMesh);
  //   const swordSize = box.getSize(new THREE.Vector3());

  //   const weapon = new Entity();
  //   weapon.addComponents([
  //     new OwnerComponent(player),
  //     new WeaponComponent({ damageAmount: 10 }),
  //     new WeaponAnchorComponent(swordMesh, new THREE.Vector3(-0.01, 0.5, 0)), // TODO: maybe could be a part of Player entity
  //     new PhysicsComponent({
  //       colliderConfig: {
  //         shape: {
  //           type: "box",
  //           sizes: { x: 0.05, y: swordSize.y, z: 0.05 },
  //         },
  //         activeEvents: ActiveEvents.CONTACT_FORCE_EVENTS,
  //         collisionGroups: InteractionGroups.PLAYER_WEAPON,
  //       },
  //     }),
  //     // new MeshConfigComponent({
  //     //   geometry: {
  //     //     type: "box",
  //     //     params: [0.05, swordSize.y, 0.05],
  //     //   },
  //     //   material: {
  //     //     type: "basic",
  //     //     params: {
  //     //       color: 0x00ff00,
  //     //       wireframe: true,
  //     //     },
  //     //   },
  //     // }),
  //   ]);

  //   this.entityManager.addEntity(weapon);
  // }

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
    modelMesh.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.frustumCulled = false;
      }
    });
    modelMesh.position.z += 0.35;
    return modelMesh;
  }
}
