import { SoundAsset } from "../constants/Sounds";
import { Entity } from "../models/Entity";

export class PlaySound {
  constructor(
    public entity: Entity,
    public sound: SoundAsset,
    public loop: boolean = false,
  ) {}
}
