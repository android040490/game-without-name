import * as THREE from "three";

import vertexShader from "../shaders/sky/vertex.glsl";
import fragmentShader from "../shaders/sky/fragment.glsl";
import { ResourcesManager } from "../managers/ResourcesManager";

export default class Sky extends THREE.Mesh<
  THREE.SphereGeometry,
  THREE.ShaderMaterial
> {
  private readonly resourcesManager: ResourcesManager;
  private readonly nightTexturePath = "textures/stars_milky_way_8k.jpg";
  private nightTexture?: THREE.Texture;
  public isSky: boolean;

  constructor() {
    const material = new THREE.ShaderMaterial({
      name: "SkyShader",
      uniforms: {
        turbidity: { value: 3 },
        rayleigh: { value: 3 },
        mieCoefficient: { value: 0.1 },
        mieDirectionalG: { value: 0.9999 },
        sunPosition: { value: new THREE.Vector3() },
        up: { value: new THREE.Vector3(0, 1, 0) },
        uDayNightMixFactor: { value: 1 },
        uNightTexture: new THREE.Uniform(null),
        fogColor: { value: new THREE.Color() }, // Default color, will be updated by scene.fog
        fogNear: { value: 1 }, // Default near, will be updated by scene.fog
        fogFar: { value: 1 }, // Default far, will be updated by scene.fog
        // If using FogExp2, also include:
        // fogDensity: { value: 0.00025 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      fog: true,
    });
    super(new THREE.SphereGeometry(1, 10, 10), material);
    this.resourcesManager = new ResourcesManager();
    this.isSky = true;

    this.loadTexture();
    this.scale.setScalar(450000);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.nightTexture?.dispose();
  }

  private async loadTexture() {
    this.nightTexture = await this.resourcesManager.loadTexture(
      this.nightTexturePath,
    );

    if (this.nightTexture) {
      this.nightTexture.colorSpace = THREE.SRGBColorSpace;
      this.nightTexture.mapping = THREE.EquirectangularReflectionMapping;
      this.material.uniforms.uNightTexture.value = this.nightTexture;
    }
  }
}
