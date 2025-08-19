import type { ITempBucket, IResultBucket, IDeck, IField, ICard, IGameRules } from "./interfaces";
import { GameRulesFactory, ESolitaireRules } from "./rules/GameRulesFactory";
import { Field, Deck, ResultBucket, TempBucket } from "./objects";

export class Game {
    private temp: ITempBucket;
    private result: IResultBucket;
    private deck: IDeck;
    private field: IField;
    private rules: IGameRules;

    constructor(rulesType: ESolitaireRules = ESolitaireRules.CLASSIC) {
        this.rules = GameRulesFactory.createRules(rulesType);
        this.deck = new Deck();
        this.deck.shuffle();
        this.field = new Field(this.deck, this.rules.columnRules);
        this.temp = new TempBucket(this.rules.tempBucketRules);
        this.result = new ResultBucket(this.rules.resultSlotRules);
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

    // Метод для получения всех слотов игры
    public getAllSlots() {
        const resultSlots = Object.values(this.result.getSlots());

        return {
            columns: this.field.getSlots(),
            temp: this.temp,
            result: resultSlots,
            deck: this.deck
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