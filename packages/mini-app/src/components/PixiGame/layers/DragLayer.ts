import * as PIXI from 'pixi.js';
import type { UIController } from '../UIController';
import { DragController } from '../controllers/DragController';
import type { Controller } from '@/core/GameController';

export class DragLayer extends PIXI.Container {
    private background!: PIXI.Graphics;

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
        
        // Настраиваем DragLayer как неинтерактивный по умолчанию
        this.eventMode = 'none';
        
        this.background = new PIXI.Graphics()
            .roundRect(0, 0, 1000, 1000, 6);
        this.addChild(this.background);

        const controller = new DragController(this, this.pixiEmitter, this.gameController);
        this.uiController.setupDragController(controller);
    }
}
