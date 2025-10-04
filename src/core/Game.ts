import Stats from "stats.js";
import { WindowSizeManager } from "./managers/WindowSizeManager";
import { TimeManager } from "./managers/TimeManager";
import { CameraManager } from "./managers/CameraManager";
import { Renderer } from "./managers/Renderer";
import { ResourcesManager } from "./managers/ResourcesManager";
import { DebugManager } from "./managers/DebugManager";
import eventBus, { EventBus } from "./event/EventBus";
import { SystemManager } from "./managers/SystemManager";
import { TimeTick } from "./event/TimeTick";
import { EntityManager } from "./managers/EntityManager";
import { System } from "./models/System";
import { Constructor } from "./type-utils/constructor";
import { PhysicsManager } from "./managers/PhysicsManager";
import { systems } from "./systems";
import { LevelManager } from "./managers/LevelManager";
import { AudioSystem } from "./systems/AudioSystem";
import { SoundAsset } from "./constants/Sounds";
import { CollisionManager } from "./managers/CollisionManager";

let instance: Game;

export class Game {
  private stats?: Stats;

  public readonly canvas!: HTMLCanvasElement;
  public readonly eventBus!: EventBus;
  public readonly debugManager!: DebugManager;
  public readonly windowSizeManager!: WindowSizeManager;
  public readonly timeManager!: TimeManager;
  public readonly resourcesManager!: ResourcesManager;
  public readonly cameraManager!: CameraManager;
  public readonly renderer!: Renderer;
  public readonly systemManager!: SystemManager;
  public readonly entityManager!: EntityManager;
  public readonly physicsManager!: PhysicsManager;
  public readonly levelManager!: LevelManager;
  public readonly collisionManager!: CollisionManager;

  constructor(canvas: HTMLCanvasElement) {
    if (instance) {
      return instance;
    }

    instance = this;
    // Setup
    this.canvas = canvas;
    this.debugManager = new DebugManager();
    this.windowSizeManager = new WindowSizeManager();
    this.timeManager = new TimeManager();
    this.resourcesManager = new ResourcesManager();
    this.cameraManager = new CameraManager(this);
    this.renderer = new Renderer(this);
    this.systemManager = new SystemManager();
    this.entityManager = new EntityManager();
    this.physicsManager = new PhysicsManager();
    this.levelManager = new LevelManager(this);
    this.collisionManager = new CollisionManager(this.physicsManager);
    this.eventBus = eventBus;

    this.update = this.update.bind(this);

    this.setSystems();
  }

  start(): void {
    // Time tick event
    this.eventBus.on(TimeTick, this.update);

    const audioSystem = this.systemManager.getSystem(AudioSystem);
    audioSystem?.setAmbientSound(SoundAsset.DangerEnvironment);

    if (this.debugManager.active) {
      this.setDebug();
    }
  }

  destroy(): void {
    this.eventBus.off(TimeTick, this.update);

    this.cameraManager.dispose();
    this.renderer.dispose();

    if (this.debugManager.active) {
      this.debugManager.destroy();
    }
  }

  private update(): void {
    if (this.debugManager.active) {
      this.stats?.begin();
    }
    this.cameraManager.update();
    this.systemManager.update();

    if (this.debugManager.active) {
      this.stats?.end();
    }
  }

  private setDebug(): void {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
  }

  private setSystems(): void {
    systems.forEach((SystemConstructor) => {
      this.addSystem(SystemConstructor);
    });
  }

  private addSystem(SystemConstructor: Constructor<System>): void {
    this.systemManager.addSystem(new SystemConstructor(this));
  }
}
