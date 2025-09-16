const { ActiveEvents } = await import("@dimforge/rapier3d");
import * as THREE from "three";
import { WeaponComponent } from "../components/WeaponComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { PositionComponent } from "../components/PositionComponent";
import { BulletComponent } from "../components/BulletComponent";
import { MeshComponent } from "../components/MeshComponent";
import { Game } from "../Game";
import { EntityManager } from "../managers/EntityManager";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { LifetimeComponent } from "../components/LifetimeComponent";
import { MuzzleFlash } from "../custom-objects/MuzzleFlash";
import { Crosshair } from "../../ui/Crosshair";
import { PlayerComponent } from "../components/PlayerComponent";

export class WeaponSystem extends System {
  private entityManager: EntityManager;
  private crosshairElement: Crosshair | null;

  constructor(game: Game) {
    super(game);
    this.entityManager = game.entityManager;

    this.crosshairElement = new Crosshair();
    document.body.appendChild(this.crosshairElement);
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(WeaponComponent);
  }

  // update(): void {
  //   for (const [_, entity] of this.entities) {
  //     const { object, offset } = entity.getComponent(WeaponAnchorComponent)!;
  //     const { collider } = entity.getComponent(PhysicsComponent)!;
  //     const { object: debugMesh } = entity.getComponent(MeshComponent) ?? {};

  //     const weaponWorldPos = new THREE.Vector3();
  //     object.getWorldPosition(weaponWorldPos);

  //     const weaponWorldQuat = new THREE.Quaternion();
  //     object.getWorldQuaternion(weaponWorldQuat);

  //     if (offset) {
  //       const rotatedOffset = offset.clone().applyQuaternion(weaponWorldQuat);
  //       weaponWorldPos.add(rotatedOffset);
  //     }

  //     debugMesh?.position.copy(weaponWorldPos);
  //     debugMesh?.quaternion.copy(weaponWorldQuat);

  //     collider?.setTranslation(weaponWorldPos);
  //     collider?.setRotation(weaponWorldQuat);
  //   }
  // }
  update(): void {
    const now = performance.now() / 1000;

    for (const [_, entity] of this.entities) {
      const weapon = entity.getComponent(WeaponComponent)!;

      weapon.canShoot = !(now - weapon.lastAttackTime < 1 / weapon.fireRate);

      if (!weapon.isShotInitiated) continue;

      weapon.isShotInitiated = false;
      weapon.lastAttackTime = now;

      if (weapon.type === "ranged") {
        this.spawnProjectiles(entity, weapon);
      } else if (weapon.type === "melee") {
        // this.performMeleeAttack(e, weapon);
      }
    }
  }

  private spawnProjectiles(entity: Entity, weapon: WeaponComponent): void {
    const {
      direction,
      projectileSpeed,
      damage,
      range,
      bulletCount,
      bulletSpread,
      bulletSize,
      bulletDensity,
    } = weapon;
    const muzzleAnchor = entity
      .getComponent(MeshComponent)
      ?.object.getObjectByName("Muzzle");

    if (entity.hasComponent(PlayerComponent)) {
      this.crosshairElement?.animateCrosshairOnFire();
    }

    if (muzzleAnchor) {
      new MuzzleFlash({ muzzleRef: muzzleAnchor, sparkCount: 25 });
    }

    for (let i = 0; i < bulletCount; i++) {
      const bulletEntity = new Entity();

      const spreadDir = direction.clone();

      if (bulletSpread > 0) {
        spreadDir.x += (Math.random() - 0.5) * bulletSpread;
        spreadDir.y += (Math.random() - 0.5) * bulletSpread;
        spreadDir.z += (Math.random() - 0.5) * bulletSpread;
        spreadDir.normalize();
      }
      const velocity = spreadDir.clone().multiplyScalar(projectileSpeed);

      const muzzlePos = new THREE.Vector3();
      muzzleAnchor?.getWorldPosition(muzzlePos);

      bulletEntity.addComponents([
        new MeshComponent(
          new THREE.Mesh(
            new THREE.SphereGeometry(bulletSize, 1, 1),
            new THREE.MeshBasicMaterial({
              color: new THREE.Color(1, 0.7686, 0),
            }),
          ),
        ),
        new PhysicsComponent({
          rigidBodyConfig: {
            rigidBodyType: "dynamic",
            ccdEnabled: true,
            linvel: velocity,
          },
          colliderConfig: {
            shape: { type: "sphere", radius: bulletSize },
            density: bulletDensity,
            activeEvents: ActiveEvents.COLLISION_EVENTS,
          },
        }),
        new PositionComponent(muzzlePos!.x, muzzlePos!.y, muzzlePos!.z),
        new BulletComponent(damage),
        new LifetimeComponent(range / projectileSpeed),
      ]);

      this.entityManager.addEntity(bulletEntity);
    }
  }
}
