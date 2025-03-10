import { System } from "../models/System";
import { Constructor } from "../type-utils/constructor";
import { RenderSystem } from "./RenderSystem";
import { PhysicsSystem } from "./PhysicsSystem";
import { MeshBuilderSystem } from "./MeshBuilderSystem";
import { EnvironmentSystem } from "./EnvironmentSystem";
import { ModelSystem } from "./ModelSystem";
import { AnimationSystem } from "./AnimationSystem";
import { CharacterMovementSystem } from "./CharacterMovementSystem";
import { EnemySpawnSystem } from "./EnemySpawnSystem";
import { CameraSystem } from "./CameraSystem";
import { PointerLockControlsSystem } from "./PointerLockControlsSystem";
import { PlayerControlSystem } from "./PlayerControlSystem";
import { EnemyControlSystem } from "./EnemyControlSystem";

// The order of the systems is important because it will affect the rendering result and the behavior of the application.
export const systems: Constructor<System>[] = [
  EnvironmentSystem,
  EnemySpawnSystem,
  EnemyControlSystem,
  ModelSystem,
  PlayerControlSystem,
  PointerLockControlsSystem,
  CharacterMovementSystem,
  AnimationSystem,
  MeshBuilderSystem,
  PhysicsSystem,
  RenderSystem,
  CameraSystem,
];
