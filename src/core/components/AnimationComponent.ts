import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
} from "three";

export class AnimationComponent {
  public readonly animationMixer: AnimationMixer;
  public readonly animationActions: Map<string, AnimationAction> = new Map();
  public currentAction?: AnimationAction;
  public currentActionName?: string;

  constructor(model: Object3D, public readonly animations: AnimationClip[]) {
    this.animationMixer = new AnimationMixer(model);

    animations.forEach((animation) => {
      this.animationActions.set(
        animation.name,
        this.animationMixer.clipAction(animation),
      );
    });

    this.currentActionName = "walk";
  }
}
