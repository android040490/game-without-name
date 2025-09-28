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
import { PlayerControlSystem } from "./PlayerControlSystem";
import { EnemyControlSystem } from "./EnemyControlSystem";
import { PlayerFactorySystem } from "./PlayerFactorySystem";
import { WeaponSystem } from "./WeaponSystem";
import { CollisionSystem } from "./CollisionSystem";
import { DamageSystem } from "./DamageSystem";
import { EnergyBarSystem } from "./EnergyBarSystem";
import { JointSystem } from "./JointSystem";
import { LifetimeSystem } from "./LifetimeSystem";
import { PlayerStateMachineSystem } from "./PlayerStateMachineSystem";
import { PlayerAnimationSystem } from "./PlayerAnimationSystem";
import { EnemyStateMachineSystem } from "./EnemyStateMachineSystem";
import { EnemyAnimationSystem } from "./EnemyAnimationSystem";
import { AudioSystem } from "./AudioSystem";

// The order of the systems is important because it will affect the rendering result and the behavior of the application.
export const systems: Constructor<System>[] = [
  EnvironmentSystem,
  EnemySpawnSystem,
  EnemyControlSystem,
  EnemyStateMachineSystem,
  EnemyAnimationSystem,
  PlayerFactorySystem,
  CharacterFactorySystem,
  PlayerControlSystem,
  PlayerStateMachineSystem,
  PlayerAnimationSystem,
  WeaponSystem,
  CharacterMovementSystem,
  AnimationSystem,
  MeshFactorySystem,
  PhysicsSystem,
  JointSystem,
  RenderSystem,
  CameraSystem,
  LifetimeSystem,
  CollisionSystem,
  DamageSystem,
  EnergyBarSystem,
  AudioSystem,
];
