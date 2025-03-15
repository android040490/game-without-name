import * as THREE from "three";

export class WeaponAnchorComponent {
  constructor(
    public readonly object: THREE.Object3D,
    public readonly offset?: THREE.Vector3,
  ) {}
}
