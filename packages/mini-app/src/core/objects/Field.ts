import { Column } from "./Column";
import { ColumnRules } from "../rules/ColumnRules";
import type { IField, IColumn, IDeck } from "../interfaces";

export class Field implements IField {
    private readonly _capacity: number = 8;
    private slots: Array<IColumn> = [];

    constructor(deck: IDeck) {
        this.slots = new Array(this._capacity).fill(null).map(() => new Column([], new ColumnRules()));
        this.fillSlots(deck);
    }

    getSlots(): Array<IColumn> {
        return this.slots;
    }

    private fillSlots(deck: IDeck): void {
        const allCards = deck.getCards();
        
        // Перебираем все карты из колоды и распределяем их по слотам по очереди
        for (let i = 0; i < allCards.length; i++) {
            const slotIndex = i % this._capacity; // Распределяем карты по кругу
            this.slots[slotIndex].addCard(allCards[i]);
        }
    }
}