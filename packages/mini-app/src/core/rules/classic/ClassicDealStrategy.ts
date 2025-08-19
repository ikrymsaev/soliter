import type { IDealStrategy } from "../interfaces";
import type { IDeck, IColumn } from "../../interfaces";

export class ClassicDealStrategy implements IDealStrategy {
    dealCards(deck: IDeck, columns: IColumn[]): void {
        // В классическом солитёре карты распределяются по кругу по всем колонкам
        let cardIndex = 0;
        
        while (!deck.isEmpty()) {
            const card = deck.drawCard();
            if (card) {
                const slotIndex = cardIndex % columns.length;
                columns[slotIndex].addCard(card);
                cardIndex++;
            }
        }
    }
}
