import classes from "./style.module.css";

export class PlayerHUD extends HTMLElement {
  static selector = "player-hud";
  private rendered = false;

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  private render(): void {
    this.id = "player-hud";
    this.className = classes.playerHud;

    this.innerHTML = `
        <div class="${classes.healthBarWrapper}">
            <img src="icons/medical-symbol.png"/>
            <div class="${classes.healthBar}">
                <div id="health-fill" class="${classes.healthFill}"></div>
            </div>
        </div>
    `;
  }

  updateHealthBar(hp: number): void {
    const bar = document.getElementById("health-fill");
    if (!bar) {
      return;
    }
    bar.style.width = `${hp}%`;

    const hue = Math.max(0, Math.min(120, hp * 1.2));
    bar.style.setProperty("--hue", `${hue}`);
  }
}
