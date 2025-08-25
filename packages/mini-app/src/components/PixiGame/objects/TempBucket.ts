import * as PIXI from "pixi.js";
import type { ITempBucket, ITempSlot } from "@/core/interfaces";
import type { Controller } from "@/core/GameController";
import { TempSlot } from "./TempSlot";

export class TempBucket extends PIXI.Container {
    private background!: PIXI.Graphics;
    private slots: TempSlot[] = [];
    private slotGap = 10;
    private slotWidth = 60;
    private slotHeight = 90;

    constructor(
        private readonly data: ITempBucket,
        private readonly controller: Controller,
        private readonly pixiEmitter: PIXI.EventEmitter
    ) {
        super();
        this.render();
    }

    private render() {
        // Создаем фон для временных слотов
        const totalWidth = this.slotWidth * 4 + this.slotGap * 3;
        this.background = new PIXI.Graphics()
            .roundRect(0, 0, totalWidth, this.slotHeight, 6)
            .fill({ color: 0xF5F5F5, alpha: 0 });
        this.addChild(this.background);

        // Создаем слоты
        this.createSlots();
    }

    private createSlots() {
        // Очищаем предыдущие слоты
        this.slots.forEach(slot => {
            this.removeChild(slot);
        });
        this.slots = [];

        // Получаем слоты из временного хранилища
        const tempSlots = this.data.slots;
        
        tempSlots.forEach((slot: ITempSlot, index: number) => {
            const slotObject = new TempSlot(
                slot,
                this.controller,
                this.pixiEmitter
            );
            
            // Позиционируем слоты горизонтально
            slotObject.x = index * (this.slotWidth + this.slotGap);
            
            this.slots.push(slotObject);
            this.addChild(slotObject);
        });
    }

    // Метод для обновления отображения
    update() {
        this.slots.forEach(slot => {
            slot.update();
        });
    }
}