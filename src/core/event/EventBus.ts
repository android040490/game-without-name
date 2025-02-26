class EventBase<T = any> {
  constructor(_: T) {}
}

type EventHandler<T> = (event: T) => void;

export class EventBus {
  private readonly handlers = new Map<Function, Set<EventHandler<any>>>();

  emit<T extends EventBase>(event: T): void {
    this.handlers.get(event.constructor)?.forEach((handler) => handler(event));
  }

  on<T extends EventBase>(
    eventType: new (...args: any[]) => T,
    handler: EventHandler<T>,
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  off<T extends EventBase>(
    eventType: new (...args: any[]) => T,
    handler: EventHandler<T>,
  ): void {
    this.handlers.get(eventType)?.delete(handler);
  }
}

export default new EventBus();
