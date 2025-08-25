import type { Controller } from "@/core/GameController";
import type { EventEmitter } from "@/core/lib/EventEmitter";
import { EPixiEvent } from "../events";
import * as PIXI from "pixi.js";

export class EmptySlot extends PIXI.Container {
    private background!: PIXI.Graphics;
    private plusText!: PIXI.Text;
    private slotWidth = 60;
    private slotHeight = 90;
    
    // Делаем слот интерактивным
    eventMode: PIXI.EventMode = 'static';
    cursor: PIXI.Cursor = 'pointer';

    constructor(
        readonly data: any, // IColumn | IResultSlot | ITempSlot
        private readonly controller: Controller,
        private readonly eventEmitter: EventEmitter,
        private readonly pixiEmitter?: PIXI.EventEmitter
    ) {
        super();
        this.on('pointerup', this.onPointerUp);
        this.render();
    }

    private onPointerUp() {
        if (this.pixiEmitter) {
            this.pixiEmitter.emit(EPixiEvent.Click, { element: this });
        }
    }

    render() {
        // Создаем пустой слот с пунктирной рамкой
        this.background = new PIXI.Graphics()
            .roundRect(0, 0, this.slotWidth, this.slotHeight, 6)
            .fill({ color: 0xFFFFFF, alpha: 0 })
            .stroke({ width: 2, color: 0xE0E0E0, alpha: 0.5 });
        this.addChild(this.background);

        // Создаем текст "+"
        this.plusText = new PIXI.Text({
            text: '+',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x9E9E9E,
                align: 'center',
            }
        });
        this.plusText.anchor.set(0.5, 0.5);
        this.plusText.x = this.slotWidth / 2;
        this.plusText.y = this.slotHeight / 2;
        this.addChild(this.plusText);
    }
}
