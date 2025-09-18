import { Crosshair } from "./Crosshair";
import { MobileControl } from "./MobileControl";

const components = [MobileControl, Crosshair];

components.forEach((component) => {
  customElements.define(component.selector, component);
});
