import type { ICard } from "./ICard";

export interface IDeck {
    readonly id: string;
    readonly type: 'deck';
    
    getCards(): ICard[];
    addCard(card: ICard): void;
    removeCard(card: ICard): boolean;
    canAcceptCard(card: ICard): boolean;
    shuffle(): void;
    drawCard(): ICard | null;
    isEmpty(): boolean;
    getCardCount(): number;
}
