import { Collider } from "@dimforge/rapier3d";
import * as THREE from "three";

export class PlayerWeaponComponent {
  constructor(
    public object: THREE.Object3D,
    public collider: Collider,
    public debugMesh?: THREE.Mesh, // TODO: remove this
  ) {}
}
