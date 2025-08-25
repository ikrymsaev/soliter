import * as PIXI from "pixi.js";
import { Card } from "./Card";
import type { Controller } from "@/core/GameController";
import type { ICard } from "@/core/interfaces";

export class CardStack extends PIXI.Container {
    private cards: Card[] = [];
    private readonly cardOverlap = 25; // Насколько карты перекрываются в стопке

    constructor(
        private readonly stackCards: ICard[],
        private readonly controller: Controller,
        private readonly pixiEmitter: PIXI.EventEmitter
    ) {
        super();
        this.createStackVisualization();
    }

    private createStackVisualization() {
        // Создаем визуальные карты для стопки
        this.stackCards.forEach((cardData, index) => {
            const cardVisual = new Card(cardData, this.controller, this.pixiEmitter);
            
            // Позиционируем карты с перекрытием
            cardVisual.y = index * this.cardOverlap;
            cardVisual.zIndex = index;
            
            // Отключаем интерактивность для карт в стопке (они не должны реагировать на события)
            cardVisual.eventMode = 'none';
            
            this.cards.push(cardVisual);
            this.addChild(cardVisual);
        });
    }

    // Метод для получения всех карт в стопке
    public getCards(): Card[] {
        return this.cards;
    }

    // Метод для получения данных карт
    public getCardData(): ICard[] {
        return this.stackCards;
    }

    // Метод для очистки стопки
    public destroy() {
        this.cards.forEach(card => {
            this.removeChild(card);
            card.destroy();
        });
        this.cards = [];
        super.destroy();
    }
}

