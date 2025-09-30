import * as THREE from "three";
import { System } from "../models/System";
import { Game } from "../Game";
import { MeshComponent } from "../components/MeshComponent";
import { Entity } from "../models/Entity";
import { CameraAdded } from "../event/CameraAdded";
import { PlayerComponent } from "../components/PlayerComponent";
import { PlaySound } from "../event/PlaySound";
import { StopSound } from "../event/StopSound";
import { ResourcesManager } from "../managers/ResourcesManager";
import { SoundAsset } from "../constants/Sounds";

export class AudioSystem extends System {
  private readonly resourcesManager: ResourcesManager;
  private listener: THREE.AudioListener;
  private activeLoops = new Map<
    Entity,
    Map<string, THREE.PositionalAudio | THREE.Audio<GainNode | PannerNode>>
  >();

  constructor(game: Game) {
    super(game);

    this.resourcesManager = game.resourcesManager;
    this.listener = new THREE.AudioListener();

    this.game.eventBus.on(PlaySound, (event: PlaySound) => {
      const { loop } = event;
      if (loop) {
        return this.playLoop(event);
      } else {
        return this.playOnce(event);
      }
    });
    this.game.eventBus.on(StopSound, (event: StopSound) => {
      return this.stopLoop(event);
    });
    this.game.eventBus.on(CameraAdded, (e: CameraAdded) =>
      this.setListenerToCamera(e.camera),
    );
  }

  private setListenerToCamera(camera: THREE.Camera) {
    camera.add(this.listener);
  }

  private playLoop(event: PlaySound) {
    const { entity, sound } = event;
    const buffer = this.resourcesManager.getAudio(sound);
    if (!buffer) {
      return;
    }

    let entityLoops = this.activeLoops.get(entity);
    if (!entityLoops) {
      entityLoops = new Map();
      this.activeLoops.set(entity, entityLoops);
    }

    if (entityLoops.has(sound)) {
      return;
    }

    const audio = this.createAudio(entity, buffer);

    audio.setLoop(true);
    audio.play();

    entityLoops.set(sound, audio);
  }

  private stopLoop(event: StopSound) {
    const { entity, sound } = event;

    const entityLoops = this.activeLoops.get(entity);
    const audio = entityLoops?.get(sound);

    if (audio) {
      audio.stop();
      audio.parent?.remove(audio);
      entityLoops?.delete(sound);
    }
  }

  private playOnce(event: PlaySound): void {
    const { entity, sound } = event;

    const buffer = this.resourcesManager.getAudio(sound);
    if (!buffer) return;

    const audio = this.createAudio(entity, buffer);

    const object3D = entity.getComponent(MeshComponent)?.object;

    audio.play();

    audio.onEnded = () => object3D?.remove(audio);
  }

  private createAudio(
    entity: Entity,
    buffer: AudioBuffer,
  ): THREE.PositionalAudio | THREE.Audio<GainNode | PannerNode> {
    const isPlayer = entity.hasComponent(PlayerComponent);
    const audio = isPlayer
      ? new THREE.Audio(this.listener)
      : new THREE.PositionalAudio(this.listener);

    audio.setBuffer(buffer);
    if (audio instanceof THREE.PositionalAudio) {
      audio.setRefDistance(5);
      audio.setMaxDistance(50);
    }

    const object3D = entity.getComponent(MeshComponent)?.object;
    if (object3D) {
      object3D.add(audio);
    }

    return audio;
  }

  // Global sound
  setAmbientSound(name: SoundAsset) {
    const buffer = this.resourcesManager.getAudio(name);
    if (!buffer) return;

    const audio = new THREE.Audio(this.listener);
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.play();
  }
}
