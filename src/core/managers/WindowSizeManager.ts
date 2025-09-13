import eventBus, { EventBus } from "../event/EventBus";
import { WindowResized } from "../event/WindowResized";

export class WindowSizeManager {
  static instance: WindowSizeManager;
  private _width!: number;
  private _height!: number;
  private _pixelRatio!: number;
  private readonly eventBus: EventBus = eventBus;

  constructor() {
    if (WindowSizeManager.instance) {
      return WindowSizeManager.instance;
    }

    WindowSizeManager.instance = this;

    this.setSizes();

    window.addEventListener("resize", () => {
      this.setSizes();

      this.eventBus.emit(new WindowResized());
    });
  }

  get windowWidth(): number {
    return this._width;
  }

  get windowHeight(): number {
    return this._height;
  }

  get pixelRatio(): number {
    return this._pixelRatio;
  }

  private setSizes(): void {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
}
