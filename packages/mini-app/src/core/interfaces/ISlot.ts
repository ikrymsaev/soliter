import type { ICard } from "./ICard";

export interface ISlot {
    canAcceptCard(card: ICard): boolean;
    addCard(card: ICard): void;
    removeCard(card: ICard): void;
    isEmpty(): boolean;
}
