import * as THREE from "three";
import Sky from "../custom-objects/Sky";
import Stars from "../custom-objects/Stars";

interface EnvironmentConfig {
  sunLightColor?: string;
  ambientLightColor?: string;
  sunLightIntensity?: number;
  ambientLightIntensity?: number;
  sunPhi?: number;
  sunTheta?: number;
}

export class EnvironmentComponent {
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public sky: Sky;
  public stars: Stars;
  public sunPhi: number;
  public sunTheta: number;

  constructor(config?: EnvironmentConfig) {
    const {
      sunLightColor = "#ffffff",
      sunLightIntensity = 4,
      sunPhi = Math.PI / 3,
      sunTheta = Math.PI / 4,
      ambientLightColor = "#ffffff",
      ambientLightIntensity = 0.2,
    } = config ?? {};
    this.sunLight = new THREE.DirectionalLight(
      sunLightColor,
      sunLightIntensity,
    );
    this.ambientLight = new THREE.AmbientLight(
      ambientLightColor,
      ambientLightIntensity,
    );
    this.sky = new Sky();
    this.stars = new Stars();
    this.sunPhi = sunPhi;
    this.sunTheta = sunTheta;
  }
}
