import type { ECardSuit } from "@/core/interfaces/ICard";
import type { IResultSlot } from "@/core/interfaces";
import type { Controller } from "@/core/GameController";
import * as PIXI from "pixi.js";
import { Card } from "./Card";
import { EPixiEvent } from "../events";

export class ResultSlot extends PIXI.Container {
    private background!: PIXI.Graphics;
    private plusText!: PIXI.Text;
    private currentCard: Card | null = null;
    private cardWidth = 60;
    private cardHeight = 90;
    
    // Делаем слот интерактивным
    eventMode: PIXI.EventMode = 'static';
    cursor: PIXI.Cursor = 'pointer';

    constructor(
        private readonly suit: ECardSuit,
        readonly data: IResultSlot,
        private readonly controller: Controller,
        private readonly pixiEmitter: PIXI.EventEmitter

    ) {
        super();
        this.on('pointerdown', this.onPointerDown);
        this.subscribeToCardChanges();
        this.render();
    }

    private subscribeToCardChanges() {
        // Подписываемся на изменения карт в слоте
        this.data.getCards().subscribe(() => {
            this.update();
        });
    }

    private onPointerDown() {
        this.pixiEmitter.emit(EPixiEvent.Click, { element: this });
    }

    render() {
        if (this.data.isEmpty()) {
            this.renderEmptySlot();
        } else {
            this.renderCardSlot();
        }
    }

    private renderEmptySlot() {
        // Создаем пустой слот с пунктирной рамкой
        this.background = new PIXI.Graphics()
            .roundRect(0, 0, this.cardWidth, this.cardHeight, 6)
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
        this.plusText.x = this.cardWidth / 2;
        this.plusText.y = this.cardHeight / 2;
        this.addChild(this.plusText);
    }

    private renderCardSlot() {
        // Удаляем элементы пустого слота
        if (this.background) {
            this.removeChild(this.background);
            this.background = null as any;
        }
        if (this.plusText) {
            this.removeChild(this.plusText);
            this.plusText = null as any;
        }

        // Обновляем карту
        this.updateCard();
    }

    private updateCard() {
        // Удаляем предыдущую карту, если она есть
        if (this.currentCard) {
            this.removeChild(this.currentCard);
            this.currentCard = null;
        }

        // Показываем последнюю карту в слоте
        const cards = this.data.getCards().get();
        if (cards.length > 0) {
            const lastCard = cards[cards.length - 1];
            this.currentCard = new Card(lastCard, this.controller, this.pixiEmitter);
            this.addChild(this.currentCard);
        }
    }

    // Метод для обновления отображения
    update() {
        // Проверяем текущее состояние слота
        const isEmpty = this.data.isEmpty();
        const hasBackground = this.background && this.children.includes(this.background);
        const hasPlusText = this.plusText && this.children.includes(this.plusText);
        const hasCard = this.currentCard && this.children.includes(this.currentCard);

        // Если состояние изменилось, перерисовываем
        if (isEmpty && (hasCard || !hasBackground || !hasPlusText)) {
            // Слот пустой, но отображается карта или нет элементов пустого слота
            this.removeChildren();
            this.render();
        } else if (!isEmpty && (hasBackground || hasPlusText || !hasCard)) {
            // Слот не пустой, но отображаются элементы пустого слота или нет карты
            this.removeChildren();
            this.render();
        } else if (!isEmpty && hasCard) {
            // Слот не пустой и есть карта - обновляем только карту
            this.updateCard();
        }
    }
}
