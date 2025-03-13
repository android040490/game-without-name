import * as THREE from "three";
import { PlayerWeaponComponent } from "../components/PlayerWeaponComponent";
import { Game } from "../Game";
import { TimeManager } from "../managers/TimeManager";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { PhysicsManager } from "../managers/PhysicsManager";
import { Collider } from "@dimforge/rapier3d";

export class PlayerAttackSystem extends System {
  private readonly timeManager: TimeManager;
  private readonly physicsManager: PhysicsManager;

  constructor(game: Game) {
    super(game);

    this.timeManager = game.timeManager;
    this.physicsManager = game.physicsManager;
  }

  appliesTo(entity: Entity): boolean {
    return entity.hasComponent(PlayerWeaponComponent);
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { collider, object, debugMesh } = entity.getComponent(
        PlayerWeaponComponent,
      )!;

      const weaponWorldPos = new THREE.Vector3();
      object.getWorldPosition(weaponWorldPos);

      const weaponWorldQuat = new THREE.Quaternion();
      object.getWorldQuaternion(weaponWorldQuat);

      const weaponOffset = new THREE.Vector3(-0.01, 0.5, 0); // TODO: do something with this hardcoded offset
      weaponOffset.applyQuaternion(weaponWorldQuat);
      weaponWorldPos.add(weaponOffset);

      debugMesh?.position.copy(weaponWorldPos);
      debugMesh?.quaternion.copy(weaponWorldQuat);

      collider.setTranslation(weaponWorldPos);
      collider.setRotation(weaponWorldQuat);
      // this.physicsManager.instance.intersectionPairsWith(
      //   collider,
      //   (collider1: Collider) => {
      //     console.log("collison", collider1.solverGroups());
      //     // if (started) {
      //     // const enemyEntity = findEnemyEntity(collider2);
      //     // if (enemyEntity) {
      //     //   applyDamage(enemyEntity, 20); // Наносим урон 20
      //     // }
      //     // }
      //   },
      // );
    }
  }
}
