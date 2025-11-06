import { Crosshair } from "./Crosshair";
import { MobileControl } from "./MobileControl";
import { PlayerHUD } from "./PlayerHUD";

const components = [MobileControl, Crosshair, PlayerHUD];

components.forEach((component) => {
  customElements.define(component.selector, component);
});
