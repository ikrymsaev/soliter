import * as PIXI from 'pixi.js';
import type { UIController } from '../UIController';
import { AnimationController } from '../controllers/AnimationController';
import type { Controller } from '@/core/GameController';

export class AnimationLayer extends PIXI.Container {
    private animationController!: AnimationController;

    constructor(
        private readonly pixiEmitter: PIXI.EventEmitter,
        private readonly uiController: UIController,
        private readonly gameController: Controller,
        width: number,
        height: number
    ) {
        super();
        this.width = width;
        this.height = height;
        
        // Анимационный слой должен быть неинтерактивным
        this.eventMode = 'none';
        
        this.animationController = new AnimationController(this, this.pixiEmitter, this.gameController);
        this.uiController.setupAnimationController(this.animationController);
    }

    getAnimationController(): AnimationController {
        return this.animationController;
    }
}
