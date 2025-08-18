import type { ICard } from "./ICard";
import type { ITempSlot } from "./ITempSlot";

export interface ITempBucket {
    readonly slots: readonly ITempSlot[];
    
    getCards(): ICard[];
    addCardToSlot(card: ICard, slot: ITempSlot): boolean;
    removeCardFromSlot(slotIndex: number): void;
    canAcceptCard(): boolean;
    getAvailableSlots(): number;
    isFull(): boolean;
    isEmpty(): boolean;
}
