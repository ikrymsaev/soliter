import type { IDrawnCardsArea } from "@/core/interfaces/IDrawnCardsArea";
import type { IDeck } from "@/core/interfaces";
import type { Controller } from "@/core/GameController";
import * as PIXI from "pixi.js";
import { Card } from "./Card";
import { EPixiEvent } from "../events";

export class DrawnCards extends PIXI.Container {
    private deckButton!: PIXI.Graphics;
    private deckTitleText!: PIXI.Text;
    private deckCountText!: PIXI.Text;
    private emptyArea!: PIXI.Graphics;
    private emptyText!: PIXI.Text;
    private currentCard: Card | null = null;
    
    private cardWidth = 60;
    private cardHeight = 90;
    private gap = 10;

    constructor(
        private readonly drawnCardsArea: IDrawnCardsArea,
        readonly data: IDeck,
        private readonly controller: Controller,
        private readonly pixiEmitter: PIXI.EventEmitter
    ) {
        super();
        this.drawnCardsArea.getCardsObservable().subscribe(() => {
            this.update();
        });
        this.render();
        this.setupInteractivity();
    }

    private setupInteractivity() {
        // Делаем кнопку колоды интерактивной
        this.deckButton.eventMode = 'static';
        this.deckButton.cursor = 'pointer';
        this.deckButton.on('pointerdown', this.onDeckClick);
    }

    private onDeckClick = () => {
        this.pixiEmitter.emit(EPixiEvent.Click, { element: this });
    }

    render() {
        // Создаем кнопку колоды
        this.renderDeckButton();
        
        // Создаем область для вытянутых карт
        this.renderDrawnCardsArea();
        
        // Обновляем отображение карт
        this.updateCards();
    }

    private renderDeckButton() {
        const isDeckEmpty = this.data.getCards().length === 0;
        const hasDrawnCards = this.drawnCardsArea.getCards().length > 0;
        
        // Определяем цвет кнопки
        let borderColor = 0x90A4AE; // Серо-синий
        let fillColor = 0xE3F2FD; // Светло-синий
        
        if (isDeckEmpty && hasDrawnCards) {
            borderColor = 0x4CAF50; // Зеленый
            fillColor = 0xE8F5E8; // Светло-зеленый
        }

        this.deckButton = new PIXI.Graphics()
            .roundRect(0, 0, this.cardWidth, this.cardHeight, 6)
            .fill({ color: fillColor, alpha: 1 })
            .stroke({ width: 2, color: borderColor });
        this.addChild(this.deckButton);

        // Создаем текст кнопки
        const buttonText = isDeckEmpty && hasDrawnCards ? 'Начать заново' : 'Колода';
        this.deckTitleText = new PIXI.Text({
            text: buttonText,
            style: {
                fontFamily: 'Arial',
                fontSize: 10,
                fill: 0x546E7A,
                align: 'center',
            }
        });
        this.deckTitleText.anchor.set(0.5, 0);
        this.deckTitleText.x = this.cardWidth / 2;
        this.deckTitleText.y = 5;
        this.addChild(this.deckTitleText);

        // Создаем текст с количеством карт
        const cardCount = this.data.getCards().length;
        this.deckCountText = new PIXI.Text({
            text: cardCount.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fontWeight: 'bold',
                fill: 0x37474F,
                align: 'center',
            }
        });
        this.deckCountText.anchor.set(0.5, 0.5);
        this.deckCountText.x = this.cardWidth / 2;
        this.deckCountText.y = this.cardHeight / 2;
        this.addChild(this.deckCountText);
    }

    private renderDrawnCardsArea() {
        // Создаем пустую область для вытянутых карт
        this.emptyArea = new PIXI.Graphics()
            .roundRect(0, 0, this.cardWidth, this.cardHeight, 6)
            .fill({ color: 0xF5F5F5, alpha: 1 })
            .stroke({ width: 2, color: 0xE0E0E0, alpha: 0.5 });
        this.emptyArea.x = this.cardWidth + this.gap;
        this.addChild(this.emptyArea);

        // Создаем текст "Пусто"
        this.emptyText = new PIXI.Text({
            text: 'Пусто',
            style: {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0x9E9E9E,
                align: 'center',
            }
        });
        this.emptyText.anchor.set(0.5, 0.5);
        this.emptyText.x = this.cardWidth + this.gap + this.cardWidth / 2;
        this.emptyText.y = this.cardHeight / 2;
        this.addChild(this.emptyText);
    }

    private updateCards() {
        const drawnCards = this.drawnCardsArea.getCards();
        
        // Удаляем предыдущую карту, если она есть
        if (this.currentCard) {
            this.removeChild(this.currentCard);
            this.currentCard = null;
        }

        // Скрываем пустую область, если есть карты
        this.emptyArea.visible = drawnCards.length === 0;
        this.emptyText.visible = drawnCards.length === 0;

        // Показываем последнюю вытянутую карту
        if (drawnCards.length > 0) {
            const lastCard = drawnCards[drawnCards.length - 1];
            this.currentCard = new Card(lastCard, this.controller, this.pixiEmitter);
            this.currentCard.x = this.cardWidth + this.gap;
            this.addChild(this.currentCard);
        }
    }

    // Метод для обновления отображения
    update() {
        // Обновляем кнопку колоды
        const isDeckEmpty = this.data.getCards().length === 0;
        const hasDrawnCards = this.drawnCardsArea.getCards().length > 0;
        
        let borderColor = 0x90A4AE;
        let fillColor = 0xE3F2FD;
        
        if (isDeckEmpty && hasDrawnCards) {
            borderColor = 0x4CAF50;
            fillColor = 0xE8F5E8;
        }

        this.deckButton.clear()
            .roundRect(0, 0, this.cardWidth, this.cardHeight, 6)
            .fill({ color: fillColor, alpha: 1 })
            .stroke({ width: 2, color: borderColor });

        const buttonText = isDeckEmpty && hasDrawnCards ? 'Начать заново' : 'Колода';
        this.deckTitleText.text = buttonText;

        const cardCount = this.data.getCards().length;
        this.deckCountText.text = cardCount.toString();

        // Обновляем карты
        this.updateCards();
    }
}
