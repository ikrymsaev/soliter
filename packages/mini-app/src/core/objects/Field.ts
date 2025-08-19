import { Column } from "./Column";
import type { IField, IColumn, IDeck } from "../interfaces";
import type { ISlotRules } from "../rules/interfaces";
import type { IDealStrategy } from "../rules/interfaces";

export class Field implements IField {
    private slots: Array<IColumn> = [];

    constructor(deck: IDeck, columnRules: ISlotRules<IColumn>, dealStrategy: IDealStrategy, columnCount: number = 8) {
        this.slots = new Array(columnCount).fill(null).map(() => new Column([], columnRules));
        this.fillSlots(deck, dealStrategy);
    }

    getSlots(): Array<IColumn> {
        return this.slots;
    }

    private fillSlots(deck: IDeck, dealStrategy: IDealStrategy): void {
        dealStrategy.dealCards(deck, this.slots);
    }
}