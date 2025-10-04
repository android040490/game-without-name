import type { Collider } from "@dimforge/rapier3d";
import { Mesh } from "three";

export interface Hurtbox {
  mesh: Mesh;
  collider: Collider;
}

export class HurtboxComponent {
  constructor(public hurtboxes: Hurtbox[]) {}
}
