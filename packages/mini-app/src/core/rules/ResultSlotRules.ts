import type { ICard } from "../interfaces";
import type { ISlotRules } from "./ISlotRules";
import type { IResultSlot } from "../interfaces";

export class ResultSlotRules implements ISlotRules<IResultSlot> {
    canAcceptCard(resultSlot: IResultSlot, card?: ICard): boolean {
        if (!card) return false;
        const cards = resultSlot.getCards().get();
        
        // Если слот пустой, можно положить только туза
        if (cards.length === 0) {
            return card.cardType === 'A';
        }
        
        // Карты должны быть одной масти и идти по возрастанию
        const topCard = cards[cards.length - 1];
        return topCard.cardSuit === card.cardSuit && 
               this.getCardValue(topCard) === this.getCardValue(card) - 1;
    }

    private getCardValue(card: ICard): number {
        const cardType = card.cardType;
        switch (cardType) {
            case 'A': return 1;
            case '2': return 2;
            case '3': return 3;
            case '4': return 4;
            case '5': return 5;
            case '6': return 6;
            case '7': return 7;
            case '8': return 8;
            case '9': return 9;
            case '10': return 10;
            case 'J': return 11;
            case 'Q': return 12;
            case 'K': return 13;
            default: return 0;
        }
    }
}
