export interface PlayerConfig {
  armsModelPath: string;
  height?: number;
  isBoundingBoxVisible?: boolean;
}

export class PlayerConfigComponent {
  public armsModelPath: string;
  public height: number;
  public isBoundingBoxVisible: boolean;

  constructor(config: PlayerConfig) {
    const { armsModelPath, height = 2, isBoundingBoxVisible = false } = config;

    this.armsModelPath = armsModelPath;
    this.height = height;
    this.isBoundingBoxVisible = isBoundingBoxVisible;
  }
}
