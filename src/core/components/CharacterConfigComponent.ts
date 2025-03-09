export interface CharacterConfig {
  modelPath?: string;
  height?: number;
  density?: number;
  isBoundingBoxVisible?: boolean;
}

export class CharacterConfigComponent {
  public height: number;
  public density: number;
  public isBoundingBoxVisible: boolean;
  public modelPath?: string;

  constructor(config?: CharacterConfig) {
    const {
      modelPath,
      height = 2,
      density = 10,
      isBoundingBoxVisible = false,
    } = config ?? {};

    this.modelPath = modelPath;
    this.height = height;
    this.density = density;
    this.isBoundingBoxVisible = isBoundingBoxVisible;
  }
}
