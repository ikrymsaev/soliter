import { TempSlot } from "./TempSlot";
import type { ISlotRules } from "../rules/ISlotRules";
import type { ITempBucket, ITempSlot } from "../interfaces";
import type { ICard } from "../interfaces/ICard";

export class TempBucket implements ITempBucket {
    private readonly rules: ISlotRules<TempBucket>;
    slots = [
        new TempSlot(),
        new TempSlot(),
        new TempSlot(),
        new TempSlot(),
    ] as const;

    constructor(rules: ISlotRules<TempBucket>) {
        this.rules = rules;
    }

    getCards(): ICard[] {
        return this.slots.map(slot => slot.card.get()).filter(card => card !== null);
    }

    addCardToSlot(card: ICard, slot: ITempSlot): boolean {
        return slot.addCard(card);
    }

    removeCardFromSlot(slotIndex: number): void {
        this.slots[slotIndex].removeCard();
    }

    canAcceptCard(): boolean {
        return this.rules.canAcceptCard(this);
    }

    getAvailableSlots(): number {
        return this.slots.filter(slot => slot.isEmpty()).length;
    }

    isFull(): boolean {
        return this.slots.every(slot => !slot.isEmpty());
    }

    isEmpty(): boolean {
        return this.slots.every(slot => slot.isEmpty());
    }
}
