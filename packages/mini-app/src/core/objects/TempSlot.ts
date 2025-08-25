import { observable } from "../lib/Observable";
import type { ITempSlot } from "../interfaces/ITempSlot";
import type { ICard } from "../interfaces/ICard";

export class TempSlot implements ITempSlot {
    card = observable<ICard | null>(null);

    removeCard(_: ICard): void {
        this.card.set(null);
    }

    canAcceptCard(_: ICard): boolean {
        return this.isEmpty();
    }

    isEmpty(): boolean {
        return this.card.get() === null;
    }

    addCard(card: ICard) {
        console.log('addCard', card, this);
        if (!this.canAcceptCard(card)) return;
        this.card.set(card);
        return;
    }
}