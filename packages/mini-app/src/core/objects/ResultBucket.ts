import { ResultSlot } from "./ResultSlot";
import { ResultSlotRules } from "../rules/ResultSlotRules";
import type { IResultBucket } from "../interfaces/IResultBucket";
import type { ICard, IResultSlot } from "../interfaces";
import { ECardSuit, ECardType } from "../interfaces/ICard";

export class ResultBucket implements IResultBucket {
    private slots: Record<ECardSuit, ResultSlot> = {
        [ECardSuit.BOOBY]: new ResultSlot(ECardSuit.BOOBY, new ResultSlotRules()),
        [ECardSuit.CHERVY]: new ResultSlot(ECardSuit.CHERVY, new ResultSlotRules()),
        [ECardSuit.PICKY]: new ResultSlot(ECardSuit.PICKY, new ResultSlotRules()),
        [ECardSuit.TREF]: new ResultSlot(ECardSuit.TREF, new ResultSlotRules())
    }; // 4 слота для 4 мастей
    public readonly id: string;
    public readonly type: 'result' = 'result';

    constructor() {
        this.id = `result-bucket-${Date.now()}`;
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
        console.log('[ResultBucket] canAcceptCard', card.getDisplayName(), 'suit:', card.cardSuit);
        
        // Проверяем, может ли слот принять карту по масти
        if (!this.slots[card.cardSuit].canAcceptCard(card)) {
            console.log(`[ResultBucket] Slot cannot accept card due to suit mismatch`);
            return false;
        }
        
        const topCard = this.slots[card.cardSuit].getTopCard();
        
        // Если слот пустой, можно положить только туз
        if (!topCard) {
            const canAccept = card.cardType === ECardType.ACE;
            console.log(`[ResultBucket] Empty slot, can accept ace: ${canAccept}`);
            return canAccept;
        }
        
        // Если слот не пустой, проверяем правила пасьянса
        const canAccept = this.isValidSequence(topCard, card);
        console.log(`[ResultBucket] Top card: ${topCard.getDisplayName()}, can accept: ${canAccept}`);
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