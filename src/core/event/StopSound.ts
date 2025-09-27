import { SoundAsset } from "../constants/Sounds";
import { Entity } from "../models/Entity";

export class StopSound {
  constructor(public entity: Entity, public sound: SoundAsset) {}
}
