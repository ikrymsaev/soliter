import { observable } from "../lib/Observable";
import type { ITempSlot } from "../interfaces/ITempSlot";
import type { ICard } from "../interfaces/ICard";

export class TempSlot implements ITempSlot {
    card = observable<ICard | null>(null);

    removeCard(): void {
        this.card.set(null);
    }

    isEmpty(): boolean {
        return this.card.get() === null;
    }

    addCard(card: ICard): boolean {
        if (!this.isEmpty()) return false;
        this.card.set(card);
        return true;
    }
}