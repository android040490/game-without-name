import * as THREE from "three";
import Sky from "../custom-objects/Sky";

interface EnvironmentConfig {
  sunLightColor?: string;
  ambientLightColor?: string;
  sunLightIntensity?: number;
  ambientLightIntensity?: number;
  nightMapTexturePath?: string;
  sunPhi?: number;
  sunTheta?: number;
}

export class EnvironmentComponent {
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public sky: Sky;
  public sunPhi: number;
  public sunTheta: number;
  public nightMapTexturePath: string;
  public texture?: THREE.Texture;

  constructor(config?: EnvironmentConfig) {
    const {
      sunLightColor = "#ffffff",
      sunLightIntensity = 4,
      sunPhi = Math.PI / 3,
      sunTheta = Math.PI / 4,
      ambientLightColor = "#ffffff",
      ambientLightIntensity = 0.2,
      nightMapTexturePath = "textures/stars_milky_way_8k.jpg",
    } = config ?? {};
    this.sunLight = new THREE.DirectionalLight(
      sunLightColor,
      sunLightIntensity,
    );
    this.ambientLight = new THREE.AmbientLight(
      ambientLightColor,
      ambientLightIntensity,
    );
    this.nightMapTexturePath = nightMapTexturePath;
    this.sky = new Sky();
    this.sunPhi = sunPhi;
    this.sunTheta = sunTheta;
  }
}
