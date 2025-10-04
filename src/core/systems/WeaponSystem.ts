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
import { Crosshair } from "../../ui/Crosshair";
import { PlayerComponent } from "../components/PlayerComponent";
import { EventBus } from "../event/EventBus";
import { WeaponReload } from "../event/WeaponReload";
import { WeaponShot } from "../event/WeaponShot";
import { PlaySound } from "../event/PlaySound";
import { InteractionGroups } from "../constants/InteractionGroups";

export class WeaponSystem extends System {
  private readonly eventBus: EventBus;
  private entityManager: EntityManager;
  private crosshairElement: Crosshair | null;

  constructor(game: Game) {
    super(game);
    this.entityManager = game.entityManager;
    this.eventBus = game.eventBus;

    this.crosshairElement = new Crosshair();
    document.body.appendChild(this.crosshairElement);
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(WeaponComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const weapon = entity.getComponent(WeaponComponent)!;

      if (weapon.type === "ranged") {
        this.handleRangeWeapon(entity, weapon);
      } else if (weapon.type === "melee") {
        // this.performMeleeAttack(e, weapon);
      }
    }
  }

  private handleRangeWeapon(entity: Entity, weapon: WeaponComponent): void {
    if (
      weapon.isReloadInitiated ||
      (weapon.isShotInitiated && weapon.isMagazineEmpty)
    ) {
      this.reloadWeapon(entity, weapon);
    } else if (weapon.isShotInitiated && !weapon.isMagazineEmpty) {
      weapon.ammoInMagazine -= 1;
      this.spawnProjectiles(entity, weapon);
    }

    weapon.isReloadInitiated = false;
    weapon.isShotInitiated = false;
  }

  private reloadWeapon(entity: Entity, weapon: WeaponComponent): void {
    if (weapon.totalAmmo) {
      const needed = weapon.magazineSize - weapon.ammoInMagazine;
      const toLoad = Math.min(needed, weapon.totalAmmo);
      weapon.totalAmmo -= toLoad;
      weapon.ammoInMagazine += toLoad;
      this.eventBus.emit(new WeaponReload(entity));
      this.eventBus.emit(new PlaySound(entity, weapon.reloadSound));
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
      muzzleFlash,
      shotSound,
    } = weapon;
    const muzzleAnchor = entity
      .getComponent(MeshComponent)
      ?.object.getObjectByName("Muzzle");

    if (entity.hasComponent(PlayerComponent)) {
      this.crosshairElement?.animateCrosshairOnFire();
    }

    muzzleFlash?.flash();

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
            collisionGroups: InteractionGroups.PROJECTILE,
          },
        }),
        new PositionComponent(muzzlePos!.x, muzzlePos!.y, muzzlePos!.z),
        new BulletComponent(damage),
        new LifetimeComponent(range / projectileSpeed),
      ]);

      this.entityManager.addEntity(bulletEntity);
    }

    this.eventBus.emit(new WeaponShot(entity));
    this.eventBus.emit(new PlaySound(entity, shotSound));
  }
}
