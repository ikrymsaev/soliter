import type { ICard } from "../../interfaces";
import type { ISlotRules } from "../interfaces";
import type { IColumn } from "../../interfaces";

export class ColumnRules implements ISlotRules<IColumn> {
    canAcceptCard(column: IColumn, card?: ICard): boolean {
        if (!card) return false;
        const topCard = column.getTopCard();
       
        // Если колонка пустая, можно положить только короля
        if (!topCard) {
            // return card.cardType === 'K';
            return true;
        }
        
        // Карты должны быть разного цвета и идти по убыванию
        const topCardInfo = topCard.getCardSuitInfo();
        const cardInfo = card.getCardSuitInfo();
        
        const differentColor = topCardInfo.color !== cardInfo.color;
        const validSequence = this.getCardValue(topCard) === this.getCardValue(card) + 1;
        return differentColor && validSequence;
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
