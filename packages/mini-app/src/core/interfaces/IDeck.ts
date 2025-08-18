import type { Card } from "../objects/Card";

export interface IDeck {
    readonly id: string;
    readonly type: 'deck';
    
    getCards(): Card[];
    addCard(card: Card): void;
    removeCard(card: Card): boolean;
    canAcceptCard(card: Card): boolean;
    shuffle(): void;
    drawCard(): Card | null;
    isEmpty(): boolean;
    getCardCount(): number;
}
