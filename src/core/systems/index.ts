import { System } from "../models/System";
import { Constructor } from "../type-utils/constructor";
import { RenderSystem } from "./RenderSystem";
import { PhysicsSystem } from "./PhysicsSystem";
import { MeshFactorySystem } from "./MeshFactorySystem";
import { EnvironmentSystem } from "./EnvironmentSystem";
import { CharacterFactorySystem } from "./CharacterFactorySystem";
import { AnimationSystem } from "./AnimationSystem";
import { CharacterMovementSystem } from "./CharacterMovementSystem";
import { EnemySpawnSystem } from "./EnemySpawnSystem";
import { CameraSystem } from "./CameraSystem";
import { PointerLockControlsSystem } from "./PointerLockControlsSystem";
import { PlayerControlSystem } from "./PlayerControlSystem";
import { EnemyControlSystem } from "./EnemyControlSystem";
import { PlayerFactorySystem } from "./PlayerFactorySystem";
import { PlayerAttackSystem } from "./PlayerAttackSystem";

// The order of the systems is important because it will affect the rendering result and the behavior of the application.
export const systems: Constructor<System>[] = [
  EnvironmentSystem,
  EnemySpawnSystem,
  EnemyControlSystem,
  PlayerFactorySystem,
  PlayerAttackSystem,
  CharacterFactorySystem,
  PlayerControlSystem,
  PointerLockControlsSystem,
  CharacterMovementSystem,
  AnimationSystem,
  MeshFactorySystem,
  PhysicsSystem,
  RenderSystem,
  CameraSystem,
];
