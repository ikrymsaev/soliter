import { Field } from "./objects/Field";
import { Deck } from "./objects/Deck";
import { ResultBucket } from "./objects/ResultBucket";
import { TempBucket } from "./objects/TempBucket";
import type { IGameRules } from "./interfaces/IGameRules";
import { GameRulesFactory, GameRulesType } from "./rules/GameRulesFactory";
import type { Card } from "./objects/Card";
import { TempBucketRules } from "./rules/TempBucketRules";

export class Game {
    private temp: TempBucket = new TempBucket(new TempBucketRules());
    private result: ResultBucket = new ResultBucket();
    private deck: Deck = new Deck();
    private field: Field;
    private rules: IGameRules;

    constructor(rulesType: GameRulesType = GameRulesType.CLASSIC_SOLITAIRE) {
        this.rules = GameRulesFactory.createRules(rulesType);
        this.deck.shuffle();
        this.field = new Field(this.deck);
    }

    public getDeck(): Deck {
        return this.deck;
    }

    public getField(): Field {
        return this.field;
    }

    public getTemp(): TempBucket {
        return this.temp;
    }

    public getResult(): ResultBucket {
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
    public getAvailableMoves(card: Card) {
        return this.rules.getAvailableMoves(card, this.getAllSlots());
    }
}