import * as THREE from "three";

export class RotationComponent {
  public rotation: THREE.Quaternion;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.rotation = new THREE.Quaternion(x, y, z, w);
  }
}
