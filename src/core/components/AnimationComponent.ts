import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
} from "three";

export interface AnimationData<Key = string> {
  actionName: Key;
  nextAnimation?: AnimationData<Key>;
  repetitions?: number;
}

export class AnimationComponent {
  public readonly animationMixer: AnimationMixer;
  public readonly animationActions: Map<string, AnimationAction> = new Map();
  public currentAction?: AnimationAction;
  public currentActionName?: string;
  public nextAnimation?: AnimationData;
  public repetitions: number = Infinity;

  constructor(
    model: Object3D,
    animations: AnimationClip[],
    currentActionName?: string,
  ) {
    this.animationMixer = new AnimationMixer(model);

    animations.forEach((animation) => {
      this.animationActions.set(
        animation.name,
        this.animationMixer.clipAction(animation),
      );
    });

    this.currentActionName = currentActionName;
  }

  set animation(value: AnimationData) {
    const { actionName, nextAnimation, repetitions = Infinity } = value;

    this.currentActionName = actionName;
    this.nextAnimation = nextAnimation;
    this.repetitions = repetitions;
  }
}
