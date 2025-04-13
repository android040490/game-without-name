import { ProgressBar } from "../custom-objects/ProgressBar";

export class EnergyBarComponent {
  public progressBar: ProgressBar;

  constructor(offsetY: number = 0) {
    this.progressBar = new ProgressBar();
    this.progressBar.scale.set(0.7, 0.02, 0);
    this.progressBar.position.y = offsetY;
  }
}
