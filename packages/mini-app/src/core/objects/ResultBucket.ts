import { ResultSlot } from "./ResultSlot";
import type { IResultBucket } from "../interfaces/IResultBucket";
import type { ICard, IResultSlot } from "../interfaces";
import { ECardSuit, ECardType } from "../interfaces/ICard";
import type { ISlotRules } from "../rules/interfaces";

export class ResultBucket implements IResultBucket {
    private slots: Record<ECardSuit, ResultSlot>; // 4 слота для 4 мастей
    public readonly id: string;
    public readonly type: 'result' = 'result';

    constructor(slotRules: ISlotRules<IResultSlot>) {
        this.id = `result-bucket-${Date.now()}`;
        this.slots = {
            [ECardSuit.BOOBY]: new ResultSlot(ECardSuit.BOOBY, slotRules),
            [ECardSuit.CHERVY]: new ResultSlot(ECardSuit.CHERVY, slotRules),
            [ECardSuit.PICKY]: new ResultSlot(ECardSuit.PICKY, slotRules),
            [ECardSuit.TREF]: new ResultSlot(ECardSuit.TREF, slotRules)
        };
    }

    public getSlots(): Record<ECardSuit, ResultSlot> {
        return this.slots;
    }

    public getCards(suit: ECardSuit): ICard[] {
        return this.slots[suit].getCards().get();
    }

    public addCard(card: ICard): void {
        this.slots[card.cardSuit].addCard(card);
    }

    public removeCard(card: ICard): boolean {
        return this.slots[card.cardSuit].removeCard(card);
    }

    public canAcceptCard(card: ICard): boolean {
        // Проверяем, может ли слот принять карту по масти
        if (!this.slots[card.cardSuit].canAcceptCard(card)) {
            return false;
        }
        
        const topCard = this.slots[card.cardSuit].getTopCard();
        
        // Если слот пустой, можно положить только туз
        if (!topCard) {
            const canAccept = card.cardType === ECardType.ACE;
            return canAccept;
        }
        
        // Если слот не пустой, проверяем правила пасьянса
        const canAccept = this.isValidSequence(topCard, card);
        return canAccept;
    }

    private isValidSequence(bottomCard: ICard, topCard: ICard): boolean {
        // Карты должны быть одной масти и идти по возрастанию
        return bottomCard.cardSuit === topCard.cardSuit && 
               this.getCardValue(bottomCard) + 1 === this.getCardValue(topCard);
    }

    private getCardValue(card: ICard): number {
        const cardType = card.cardType;
        switch (cardType) {
            case ECardType.ACE: return 1;
            case ECardType.TWO: return 2;
            case ECardType.THREE: return 3;
            case ECardType.FOUR: return 4;
            case ECardType.FIVE: return 5;
            case ECardType.SIX: return 6;
            case ECardType.SEVEN: return 7;
            case ECardType.EIGHT: return 8;
            case ECardType.NINE: return 9;
            case ECardType.TEN: return 10;
            case ECardType.JACK: return 11;
            case ECardType.QUEEN: return 12;
            case ECardType.KING: return 13;
            default: return 0;
        }
    }

    public getAvailableSlots(): number {
        return Object.values(this.slots).filter(slot => slot.isEmpty()).length;
    }

    public isFull(): boolean {
        return Object.values(this.slots).every(slot => slot.isFull()); // От туза до короля
    }

    public isSlotEmpty(suit: ECardSuit): boolean {
        return this.slots[suit].isEmpty();
    }

    public getTopCard(suit: ECardSuit): ICard | null {
        return this.slots[suit].getTopCard();
    }

    public getTopCardByCard(card: ICard): ICard | null {
        return this.slots[card.cardSuit].getTopCard();
    }

    public getSlotIndex(card: ICard): number {
        return Object.values(this.slots).findIndex(slot => slot.getCards().get().includes(card));
    }

    public getSlotByCard(card: ICard): IResultSlot | null {
        const slot = this.slots[card.cardSuit];
        return slot.getCards().get().includes(card) ? slot : null;
    }
}