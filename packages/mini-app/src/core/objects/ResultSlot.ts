import { observable, type IObservable } from "../lib/Observable";
import type { ISlotRules } from "../rules/ISlotRules";
import type { IResultSlot, ICard } from "../interfaces";
import { ECardSuit } from "../interfaces/ICard";

export class ResultSlot implements IResultSlot {
    private cards = observable<ICard[]>([]);
    private readonly rules: ISlotRules<ResultSlot>;

    constructor(
        public readonly suit: ECardSuit,
        rules: ISlotRules<ResultSlot>
    ) {
        this.rules = rules;
    }

    public getCards(): IObservable<ICard[]> {
        return this.cards;
    }

    public addCard(card: ICard): void {
        this.cards.set((prev) => [...prev, card]);
    }
    
    public removeCard(card: ICard): boolean {
        const index = this.cards.get().indexOf(card);
        if (index > -1) {
            this.cards.set((prev) => prev.filter((c) => c !== card));
            return true;
        }
        return false;
    }
    
    public canAcceptCard(card: ICard): boolean {
        return this.rules.canAcceptCard(this, card);
    }
    
    
    public isFull(): boolean {
        return this.cards.get().length === 13;
    }
    
    public isEmpty(): boolean {
        return this.cards.get().length === 0;
    }
    
    
    public getTopCard(): ICard | null {
        return this.cards.get().length > 0 ? this.cards.get()[this.cards.get().length - 1] : null;
    }
    
}