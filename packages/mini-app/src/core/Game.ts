import type { ITempBucket, IResultBucket, IDeck, IField, ICard, IGameRules } from "./interfaces";
import { GameRulesFactory, ESolitaireRules } from "./rules/GameRulesFactory";
import { Field, Deck, ResultBucket, TempBucket } from "./objects";
import { DrawnCardsArea } from "./objects/DrawnCardsArea";

export class Game {
    private temp: ITempBucket;
    private result: IResultBucket;
    private deck: IDeck;
    private field: IField;
    private rules: IGameRules;
    private drawnCardsArea: DrawnCardsArea | null = null;

    public rulesType: ESolitaireRules;

    constructor(rulesType: ESolitaireRules) {
        this.rulesType = rulesType;
        this.rules = GameRulesFactory.createRules(rulesType);
        this.deck = new Deck();
        this.deck.shuffle();
        
        this.field = new Field(this.deck, this.rules.columnRules, this.rules.dealStrategy, this.rules.columnCount);
        this.temp = new TempBucket(this.rules.tempBucketRules);
        this.result = new ResultBucket(this.rules.resultSlotRules);
        
        // Создаем область для вытянутых карт только для Косынки
        if (rulesType === ESolitaireRules.KLONDIKE) {
            this.drawnCardsArea = new DrawnCardsArea();
        }
    }

    public getDeck(): IDeck {
        return this.deck;
    }

    public getField(): IField {
        return this.field;
    }

    public getTemp(): ITempBucket {
        return this.temp;
    }

    public getResult(): IResultBucket {
        return this.result;
    }

    public getDrawnCardsArea(): DrawnCardsArea | null {
        return this.drawnCardsArea;
    }

    // Метод для получения всех слотов игры
    public getAllSlots() {
        const resultSlots = Object.values(this.result.getSlots());

        return {
            columns: this.field.getSlots(),
            temp: this.temp,
            result: resultSlots,
            deck: this.deck,
            drawnCardsArea: this.drawnCardsArea || undefined
        };
    }

    /**
     * Получает правила игры
     */
    public getRules(): IGameRules {
        return this.rules;
    }

    /**
     * Проверяет, завершена ли игра
     */
    public isGameCompleted(): boolean {
        return this.rules.isGameCompleted(this.result);
    }

    /**
     * Получает доступные ходы для карты
     */
    public getAvailableMoves(card: ICard) {
        return this.rules.getAvailableMoves(card, this.getAllSlots());
    }
}