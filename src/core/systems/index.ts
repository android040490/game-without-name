import { System } from "../models/System";
import { Constructor } from "../type-utils/constructor";
import { RenderSystem } from "./RenderSystem";
import { PhysicsSystem } from "./PhysicsSystem";
import { MeshFactorySystem } from "./MeshFactorySystem";
import { EnvironmentSystem } from "./EnvironmentSystem";
import { AnimationSystem } from "./AnimationSystem";
import { CharacterMovementSystem } from "./CharacterMovementSystem";
import { EnemySpawnSystem } from "./EnemySpawnSystem";
import { CameraSystem } from "./CameraSystem";
import { PlayerControlSystem } from "./PlayerControlSystem";
import { EnemyControlSystem } from "./EnemyControlSystem";
import { PlayerFactorySystem } from "./PlayerFactorySystem";
import { WeaponSystem } from "./WeaponSystem";
import { DamageSystem } from "./DamageSystem";
import { EnemyHealthSystem } from "./EnemyHealthSystem";
import { JointSystem } from "./JointSystem";
import { LifetimeSystem } from "./LifetimeSystem";
import { PlayerStateMachineSystem } from "./PlayerStateMachineSystem";
import { PlayerAnimationSystem } from "./PlayerAnimationSystem";
import { EnemyStateMachineSystem } from "./EnemyStateMachineSystem";
import { EnemyAnimationSystem } from "./EnemyAnimationSystem";
import { AudioSystem } from "./AudioSystem";
import { HitboxSystem } from "./HitboxSystem";

// The order of the systems is important because it will affect the rendering result and the behavior of the application.
export const systems: Constructor<System>[] = [
  EnvironmentSystem,
  EnemySpawnSystem,
  EnemyControlSystem,
  EnemyStateMachineSystem,
  EnemyAnimationSystem,
  PlayerFactorySystem,
  PlayerControlSystem,
  PlayerStateMachineSystem,
  PlayerAnimationSystem,
  WeaponSystem,
  CharacterMovementSystem,
  AnimationSystem,
  MeshFactorySystem,
  HitboxSystem,
  DamageSystem,
  PhysicsSystem,
  JointSystem,
  RenderSystem,
  CameraSystem,
  LifetimeSystem,
  EnemyHealthSystem,
  AudioSystem,
];
