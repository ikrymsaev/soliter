import type { ITempSlot } from "@/core/interfaces";
import type { Controller } from "@/core/GameController";
import * as PIXI from "pixi.js";
import { Card } from "./Card";
import { EPixiEvent } from "../events";

export class TempSlot extends PIXI.Container {
    private background!: PIXI.Graphics;
    private currentCard: Card | null = null;
    private slotWidth = 60;
    private slotHeight = 90;
    
    // Делаем слот интерактивным
    eventMode: PIXI.EventMode = 'static';
    cursor: PIXI.Cursor = 'pointer';

    constructor(
        readonly data: ITempSlot,
        private readonly controller: Controller,
        private readonly pixiEmitter: PIXI.EventEmitter
    ) {
        super();
        this.on('pointerdown', this.onPointerDown);
        this.subscribeToCardChanges();
        this.render();
    }

    private subscribeToCardChanges() {
        // Подписываемся на изменения карты в слоте
        this.data.card.subscribe(() => {
            this.updateCard();
        });
    }

    private onPointerDown() {
        this.pixiEmitter.emit(EPixiEvent.Click, { element: this });
    }

    render() {
        // Создаем фон слота
        this.background = new PIXI.Graphics()
            .roundRect(0, 0, this.slotWidth, this.slotHeight, 6)
            .fill({ color: 0xFFFFFF, alpha: 0.1 })
            .stroke({ width: 1, color: 0xE0E0E0, alpha: 0.5 });
        this.addChild(this.background);

        // Обновляем отображение карты
        this.updateCard();
    }

    private updateCard() {
        // Удаляем предыдущую карту, если она есть
        if (this.currentCard) {
            this.removeChild(this.currentCard);
            this.currentCard = null;
        }

        // Проверяем, есть ли карта в слоте
        const card = this.data.card.get();
        if (card) {
            this.currentCard = new Card(card, this.controller, this.pixiEmitter);
            this.addChild(this.currentCard);
        }
    }

    // Метод для обновления отображения
    update() {
        this.updateCard();
    }
}