import { Component, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import {
  AnimationController,
  GestureController,
  IonCard,
} from '@ionic/angular';
import type { Animation, Gesture, GestureDetail } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ionic';

  @ViewChild(IonCard, { read: ElementRef })
  card!: ElementRef<HTMLIonCardElement>;
  @ViewChild('p', { static: true }) p: any;

  private animation: Animation | undefined;
  private gesture: Gesture | undefined;
  private started = false;
  private initialStep = 0;

  /**
   * The track is 344px wide.
   * The card is 100px wide.
   * We want 16px of margin on each end of the track.
   */
  private readonly MAX_TRANSLATE = window.innerWidth - 40;

  constructor(
    private animationCtrl: AnimationController,
    private gestureCtrl: GestureController
  ) {}

  private onMove(ev: GestureDetail) {
    if (!this.started) {
      this.animation?.progressStart();
      this.started = true;
    }

    this.animation?.progressStep(this.getStep(ev));
  }

  private onEnd(ev: GestureDetail) {
    if (!this.started) {
      return;
    }

    this.gesture?.enable(false);

    const step = this.getStep(ev);
    const shouldComplete = step > 0.5;

    this.animation?.progressEnd(shouldComplete ? 1 : 0, step).onFinish(() => {
      this.gesture?.enable(true);
    });

    this.initialStep = shouldComplete ? this.MAX_TRANSLATE : 0;
    this.started = false;
  }

  private clamp(min: number, n: number, max: number) {
    return Math.max(min, Math.min(n, max));
  }

  private getStep(ev: GestureDetail) {
    const delta = this.initialStep + ev.deltaX;
    const al = this.clamp(0, delta / this.MAX_TRANSLATE, 1);
    const el = this.card.nativeElement.children[0];
    if (al == 1) {
      el.classList.add('danger');
      // this.p.nativeElement.classList.add('left')
      // this.p.nativeElement.style.display = 'block'
      el.children[0].setAttribute('src', './../assets/arrow-left.svg');
    } else if (al == 0) {
      el.classList.remove('danger');
      // this.p.nativeElement.style.display = 'block'
      // this.p.nativeElement.classList.remove('left')
      el.children[0].setAttribute('src', './../assets/arrow-right.svg');
    }
    else {
      // this.p.nativeElement.style.display = 'none'
    }
    return al;
  }

  ngAfterViewInit() {
    this.animation = this.animationCtrl
      .create()
      .addElement(this.card?.nativeElement)
      .duration(1000)
      .fromTo(
        'transform',
        'translateX(0)',
        `translateX(${this.MAX_TRANSLATE}px)`
      );

    const gesture = (this.gesture = this.gestureCtrl.create({
      el: this.card?.nativeElement,
      threshold: 0,
      gestureName: 'card-drag',
      onMove: (ev) => this.onMove(ev),
      onEnd: (ev) => this.onEnd(ev),
    }));

    gesture.enable(true);
  }
}
