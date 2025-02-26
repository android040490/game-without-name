import eventBus, { EventBus } from "../event/EventBus";
import { TimeTick } from "../event/TimeTick";

export class TimeManager {
  private start: number;
  private current: number;
  private _elapsed: number;
  private _delta: number;
  private readonly eventBus: EventBus = eventBus;

  constructor() {
    this.start = Date.now();
    this.current = this.start;
    this._elapsed = 0;
    this._delta = 16;

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  get elapsed(): number {
    return this._elapsed;
  }

  get delta(): number {
    return this._delta;
  }

  private tick(): void {
    const currentTime = Date.now();
    this._delta = currentTime - this.current;
    this.current = currentTime;
    this._elapsed = this.current - this.start;

    this.eventBus.emit(new TimeTick());

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}
