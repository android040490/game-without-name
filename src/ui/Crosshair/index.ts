import classes from "./style.module.css";

export class Crosshair extends HTMLElement {
  static selector = "fps-crosshair";
  private rendered = false;

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  private render(): void {
    this.id = "crosshair";
    this.className = classes.crosshair;
    this.innerHTML = `
        <div class="${classes.stick} ${classes.top}"></div>
        <div class="${classes.stick} ${classes.bottom}"></div>
        <div class="${classes.stick} ${classes.left}"></div>
        <div class="${classes.stick} ${classes.right}"></div>
    `;
  }

  public animateCrosshairOnFire(): void {
    this.style.transition = "transform 90ms ease-out";
    this.style.transform = "translate(-50%, -50%) scale(1.5)";
    setTimeout(() => {
      this.style.transform = "translate(-50%, -50%) scale(1.0)";
    }, 90);
  }
}
