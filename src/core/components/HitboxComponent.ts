import type { Collider } from "@dimforge/rapier3d";
import { Mesh } from "three";

export interface Hitbox {
  mesh: Mesh;
  collider: Collider;
}

export class HitboxComponent {
  constructor(public hurtboxes: Hitbox[]) {}
}
