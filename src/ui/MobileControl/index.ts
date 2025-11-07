import classes from "./style.module.css";

export type JoystickMoveEvent = CustomEvent<{
  x: number;
  y: number;
  fullTilt?: boolean;
}>;
export type LookMoveEvent = CustomEvent<{ x: number; y: number }>;

export interface MobileControlElementEvents {
  "joystick-move": JoystickMoveEvent;
  "look-move": LookMoveEvent;
  "jump-click": CustomEvent<undefined>;
  "attack-click": CustomEvent<undefined>;
}

export class MobileControl extends HTMLElement {
  static selector = "mobile-control";
  private rendered = false;
  private fullscreenEnabled = document.fullscreenEnabled;
  private moveFingerId: number | null = null;
  private lookFingerId: number | null = null;
  private joystick: HTMLElement | null = null;
  private stick: HTMLElement | null = null;
  private jumpButton: HTMLElement | null = null;
  private attackButton: HTMLElement | null = null;
  private readonly touchSensitivity = 0.004;

  private joyStartX = 0;
  private joyStartY = 0;
  private touchX = 0;
  private touchY = 0;

  constructor() {
    super();

    this.startLook = this.startLook.bind(this);
    this.updateLook = this.updateLook.bind(this);
    this.stopLook = this.stopLook.bind(this);
    this.startMovement = this.startMovement.bind(this);
    this.move = this.move.bind(this);
    this.stopMovement = this.stopMovement.bind(this);
    this.dispatchJumpEvent = this.dispatchJumpEvent.bind(this);
    this.dispatchAttackEvent = this.dispatchAttackEvent.bind(this);
  }

  emit<K extends keyof MobileControlElementEvents>(
    type: K,
    detail?: MobileControlElementEvents[K]["detail"],
  ): boolean {
    return this.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  addEventListener<K extends keyof MobileControlElementEvents>(
    type: K,
    listener: (event: MobileControlElementEvents[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, listener as EventListener, options);
  }

  removeEventListener<K extends keyof MobileControlElementEvents>(
    type: K,
    listener: (event: MobileControlElementEvents[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, listener as EventListener, options);
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.setListeners();
      this.rendered = true;
    }
  }

  disconnectedCallback() {
    this.removeListeners();
  }

  private render(): void {
    this.innerHTML = `
      <div id="mobile-control" class="${classes.mobileControl}">
        <div id="joystick" class="${classes.joystick}">
          <div id="stick" class="${classes.stick}"></div>
        </div>
        <div class="${classes.actionBtns}">
          <div id="attack" class="${classes.actionBtn}"><img src="icons/bullet.png"/></div>
          <div id="jump" class="${classes.actionBtn}"><img src="icons/jumping.png"/></div>
        </div>
      </div>
    `;

    this.joystick = document.getElementById("joystick");
    this.stick = document.getElementById("stick");
    this.jumpButton = document.getElementById("jump");
    this.attackButton = document.getElementById("attack");
  }

  private setListeners(): void {
    // === Camera look (right half of screen) ===
    window.addEventListener("touchstart", this.startLook);
    window.addEventListener("touchmove", this.updateLook);
    window.addEventListener("touchend", this.stopLook);
    // // === Joystick movement (left side) ===
    this.joystick?.addEventListener("touchstart", this.startMovement);
    this.joystick?.addEventListener("touchmove", this.move);
    this.joystick?.addEventListener("touchend", this.stopMovement);

    // === Jump button ===
    this.jumpButton?.addEventListener("touchstart", this.dispatchJumpEvent);
    // === Attack button ===
    this.attackButton?.addEventListener("touchstart", this.dispatchAttackEvent);
  }

  private removeListeners() {
    window.removeEventListener("touchstart", this.startLook);
    window.removeEventListener("touchmove", this.updateLook);
    window.removeEventListener("touchend", this.stopLook);
    this.joystick?.removeEventListener("touchstart", this.startMovement);
    this.joystick?.removeEventListener("touchmove", this.move);
    this.joystick?.removeEventListener("touchend", this.stopMovement);
    this.jumpButton?.removeEventListener("touchstart", this.dispatchJumpEvent);
    this.attackButton?.removeEventListener(
      "touchstart",
      this.dispatchAttackEvent,
    );
  }

  private startLook(event: TouchEvent): void {
    if (this.fullscreenEnabled) {
      document.documentElement.requestFullscreen();
    }
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.clientX > window.innerWidth / 2 && this.lookFingerId === null) {
        this.lookFingerId = touch.identifier;
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
      }
    }
  }

  private updateLook(event: TouchEvent): void {
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.lookFingerId) {
        const deltaX = touch.clientX - this.touchX;
        const deltaY = touch.clientY - this.touchY;

        this.emit("look-move", {
          x: deltaX * this.touchSensitivity,
          y: deltaY * this.touchSensitivity,
        });

        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
      }
    }
  }

  private stopLook(event: TouchEvent): void {
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.lookFingerId) {
        this.lookFingerId = null;
      }
    }
  }

  private startMovement(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    this.moveFingerId = touch.identifier;
    this.joyStartX = touch.clientX;
    this.joyStartY = touch.clientY;
  }

  private move(event: TouchEvent): void {
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.moveFingerId) {
        const joyDeltaX = touch.clientX - this.joyStartX;
        const joyDeltaY = touch.clientY - this.joyStartY;

        const maxDist = 60;
        const dist = Math.min(
          Math.sqrt(joyDeltaX ** 2 + joyDeltaY ** 2),
          maxDist,
        );

        const fullTilt = dist > maxDist * 0.9;
        this.emit("joystick-move", { x: joyDeltaX, y: joyDeltaY, fullTilt });

        const angle = Math.atan2(joyDeltaY, joyDeltaX);

        this.stick!.style.transform = `translate(${Math.cos(angle) * dist}px, ${
          Math.sin(angle) * dist
        }px)`;
      }
    }
  }

  private stopMovement(event: TouchEvent): void {
    for (let touch of Array.from(event.changedTouches)) {
      if (touch.identifier === this.moveFingerId) {
        this.emit("joystick-move", { x: 0, y: 0 });
        this.moveFingerId = null;
        this.stick!.style.transform = "translate(0px, 0px)";
      }
    }
  }

  private dispatchJumpEvent(): void {
    this.emit("jump-click");
  }

  private dispatchAttackEvent(): void {
    this.emit("attack-click");
  }
}
