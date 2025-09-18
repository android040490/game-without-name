import * as THREE from "three";

import vertexShader from "../shaders/stars/vertex.glsl";
import fragmentShader from "../shaders/stars/fragment.glsl";
import { ResourcesManager } from "../managers/ResourcesManager";

export default class Stars extends THREE.Mesh<
  THREE.SphereGeometry,
  THREE.ShaderMaterial
> {
  private readonly texturePath = "textures/stars_milky_way_8k.jpg";
  private readonly resourcesManager: ResourcesManager;
  private texture?: THREE.Texture;

  constructor() {
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      name: "StarsShader",
      uniforms: {
        uTexture: new THREE.Uniform(null),
        uOpacity: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    super(new THREE.SphereGeometry(1, 10, 10), material);
    this.scale.setScalar(450000);

    this.resourcesManager = new ResourcesManager();
    this.loadTexture();
  }

  dispose(): void {
    this.material.dispose();
    this.geometry.dispose();
    this.texture?.dispose();
  }

  private async loadTexture() {
    this.texture = await this.resourcesManager.loadTexture(this.texturePath);

    if (this.texture) {
      this.texture.colorSpace = THREE.SRGBColorSpace;
      this.texture.mapping = THREE.EquirectangularReflectionMapping;
      this.material.uniforms.uTexture.value = this.texture;
    }
  }
}
