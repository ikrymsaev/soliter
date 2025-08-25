import type { ICard } from "./ICard";
import type { ISlot } from "./ISlot";

export interface IDeck extends ISlot {
    getCards(): ICard[];
    addCard(card: ICard): void;
    removeCard(card: ICard): boolean;
    canAcceptCard(card: ICard): boolean;
    shuffle(): void;
    drawCard(): ICard | null;
    isEmpty(): boolean;
    getCardCount(): number;
}
