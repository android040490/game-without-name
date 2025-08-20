import { MobileControl } from "./MobileControl";

const components = [MobileControl];

components.forEach((component) => {
  customElements.define(component.selector, component);
});
