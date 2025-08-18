import { observable } from "../lib/Observable";
import type { ISlotRules } from "../rules/ISlotRules";
import type { IColumn, ICard } from "../interfaces";

export class Column implements IColumn {
    private cards = observable<ICard[]>([]);
    public readonly id: string;
    private readonly rules: ISlotRules<Column>;

    constructor(cards: ICard[], rules: ISlotRules<Column>, id?: string) {
        this.cards.set(cards);
        this.rules = rules;
        this.id = id || `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    public getCards(): ICard[] {
        return this.cards.get();
    }

    public getCardsObservable() {
        return this.cards;
    }

    public addCard(card: ICard): void {
        this.cards.set((prev) => [...prev, card]);
    }

    public removeCard(card: ICard): boolean {
        const currentCards = this.cards.get();
        const index = currentCards.indexOf(card);
        if (index > -1) {
            this.cards.set((prev) => prev.filter((c) => c !== card));
            return true;
        }
        return false;
    }

    public canAcceptCard(card: ICard): boolean {
        console.log('[Column] canAcceptCard', card.getDisplayName(), 'for column', this.id);
        return this.rules.canAcceptCard(this, card);
    }

    // Дополнительные методы для работы с колонкой
    public getTopCard(): ICard | null {
        const cards = this.cards.get();
        return cards.length > 0 ? cards[cards.length - 1] : null;
    }

    public isEmpty(): boolean {
        return this.cards.get().length === 0;
    }

    public getCardCount(): number {
        return this.cards.get().length;
    }
}