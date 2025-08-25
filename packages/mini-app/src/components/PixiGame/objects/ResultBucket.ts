import type { IResultBucket } from "@/core/interfaces";
import type { Controller } from "@/core/GameController";
import { ECardSuit } from "@/core/interfaces/ICard";
import * as PIXI from "pixi.js";
import { ResultSlot } from "./ResultSlot";

export class ResultBucket extends PIXI.Container {
    private slots: Map<ECardSuit, ResultSlot> = new Map();
    private slotGap = 10;

    constructor(
        private readonly data: IResultBucket,
        private readonly controller: Controller,
        private readonly pixiEmitter: PIXI.EventEmitter
    ) {
        super();
        this.render();
    }

    render() {
        // Создаем слоты для каждой масти
        const suits = [ECardSuit.BOOBY, ECardSuit.CHERVY, ECardSuit.PICKY, ECardSuit.TREF];
        
        suits.forEach((suit, index) => {
            const slot = this.data.getSlots()[suit];
            const slotObject = new ResultSlot(
                suit,
                slot,
                this.controller,
                this.pixiEmitter
            );
            
            // Размещаем слоты горизонтально с отступом
            slotObject.x = index * (slotObject.width + this.slotGap);
            
            this.slots.set(suit, slotObject);
            this.addChild(slotObject);
        });
    }

    // Метод для обновления отображения
    update() {
        this.slots.forEach(slot => {
            slot.update();
        });
    }

    // Метод для получения конкретного слота
    getSlot(suit: ECardSuit): ResultSlot | undefined {
        return this.slots.get(suit);
    }
}
