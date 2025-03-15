import * as THREE from "three";
import { WeaponComponent } from "../components/WeaponComponent";
import { Entity } from "../models/Entity";
import { System } from "../models/System";
import { WeaponAnchorComponent } from "../components/WeaponAnchorComponent";
import { MeshComponent } from "../components/MeshComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";

export class WeaponSystem extends System {
  appliesTo(entity: Entity): boolean {
    return entity.hasComponents(
      WeaponComponent,
      WeaponAnchorComponent,
      PhysicsComponent,
    );
  }

  update(): void {
    for (const [_, entity] of this.entities) {
      const { object, offset } = entity.getComponent(WeaponAnchorComponent)!;
      const { collider } = entity.getComponent(PhysicsComponent)!;
      const { object: debugMesh } = entity.getComponent(MeshComponent) ?? {};

      const weaponWorldPos = new THREE.Vector3();
      object.getWorldPosition(weaponWorldPos);

      const weaponWorldQuat = new THREE.Quaternion();
      object.getWorldQuaternion(weaponWorldQuat);

      if (offset) {
        const rotatedOffset = offset.clone().applyQuaternion(weaponWorldQuat);
        weaponWorldPos.add(rotatedOffset);
      }

      debugMesh?.position.copy(weaponWorldPos);
      debugMesh?.quaternion.copy(weaponWorldQuat);

      collider?.setTranslation(weaponWorldPos);
      collider?.setRotation(weaponWorldQuat);
    }
  }
}
