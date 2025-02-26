import * as THREE from "three";
import { TextureConfig, TexturePaths } from "../factories/MeshBuilder";

export class TextureComponent {
  public readonly texturePaths: TexturePaths;
  public readonly colorSpace: string;
  public readonly useCache: boolean;
  public readonly repeat: THREE.Vector2 = new THREE.Vector2(1, 1);
  public readonly wrapS = THREE.RepeatWrapping;
  public readonly wrapT = THREE.RepeatWrapping;

  constructor(textureConfig: TextureConfig) {
    const { colorSpace, texturePaths, useCache } = textureConfig;

    this.texturePaths = texturePaths;
    this.colorSpace = colorSpace ?? THREE.SRGBColorSpace;
    this.useCache = useCache ?? true;
  }
}
