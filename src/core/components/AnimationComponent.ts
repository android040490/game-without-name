import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
} from "three";

export interface AnimationData<Key = string> {
  actionName: Key;
  repetitions?: number;
  timeScale?: number;
}

export class AnimationComponent {
  public readonly animationMixer: AnimationMixer;
  public readonly animationActions: Map<string, AnimationAction> = new Map();
  public currentAction?: AnimationAction;
  public currentActionName?: string;
  public repetitions: number = Infinity;
  public timeScale: number = 1;
  public completeHandler?: () => void;

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

    this.handleComplete = this.handleComplete.bind(this);
  }

  set animation(value: AnimationData) {
    const { actionName, repetitions = Infinity, timeScale = 1 } = value;

    this.currentActionName = actionName;
    this.repetitions = repetitions;
    this.timeScale = timeScale;
  }

  public handleComplete(): void {
    this.completeHandler?.();
  }
}
