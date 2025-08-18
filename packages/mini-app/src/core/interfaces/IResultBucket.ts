import type { ECardSuit, ICard } from "./ICard";
import type { IResultSlot } from "./IResultSlot";

export interface IResultBucket {
    readonly id: string;
    readonly type: 'result';
    
    getSlots(): Record<ECardSuit, IResultSlot>;
    getCards(suit: ECardSuit): ICard[];
    addCard(card: ICard): void;
    removeCard(card: ICard): boolean;
    canAcceptCard(card: ICard): boolean;
    getAvailableSlots(): number;
    isFull(): boolean;
    isSlotEmpty(suit: ECardSuit): boolean;
    getTopCard(suit: ECardSuit): ICard | null;
    getTopCardByCard(card: ICard): ICard | null;
    getSlotIndex(card: ICard): number;
    getSlotByCard(card: ICard): IResultSlot | null;
}
