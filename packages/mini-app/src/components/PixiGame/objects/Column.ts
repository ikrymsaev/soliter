import type { IColumn } from "@/core/interfaces";
import * as PIXI from "pixi.js";
import { Card } from "./Card";
import { EmptySlot } from "./EmptySlot";
import type { Controller } from "@/core/GameController";
import type { EventEmitter } from "@/core/lib/EventEmitter";

export class Column extends PIXI.Container {
    private cards: Card[] = [];
    private emptySlot: EmptySlot | null = null;
    private cardOverlap = 25; // Насколько карты перекрываются

    constructor(
        readonly data: IColumn,
        private readonly controller: Controller,
        private readonly eventEmitter: EventEmitter,
        private readonly pixiEmitter: PIXI.EventEmitter
    ) {
        super();
        this.data.getCardsObservable().subscribe(this.update);
        this.render();
    }

    render() {
        // Очищаем предыдущие элементы
        this.cards.forEach(card => {
            this.removeChild(card);
        });
        this.cards = [];

        // Удаляем пустой слот, если он есть
        if (this.emptySlot) {
            this.removeChild(this.emptySlot);
            this.emptySlot = null;
        }

        // Получаем карты из колонки
        const columnCards = this.data.getCards();
        
        if (columnCards.length > 0) {
            // Отображаем карты
            columnCards.forEach((card, index) => {
                const cardObject = new Card(card, this.controller, this.pixiEmitter);
                
                // Позиционируем карты с перекрытием
                cardObject.y = index * this.cardOverlap;
                
                // Устанавливаем z-index для правильного отображения
                cardObject.zIndex = index;
                
                this.cards.push(cardObject);
                this.addChild(cardObject);
            });
        } else {
            // Отображаем пустой слот
            this.renderEmptySlot();
        }
    }

    private renderEmptySlot() {
        // Создаем пустой слот используя новый класс
        this.emptySlot = new EmptySlot(
            this.data,
            this.controller,
            this.eventEmitter,
            this.pixiEmitter
        );
        this.addChild(this.emptySlot);
    }

    // Метод для обновления отображения
    update = () => this.render();
}