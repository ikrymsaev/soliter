import type { IDealStrategy } from "../interfaces";
import type { IDeck, IColumn } from "../../interfaces";

export class KlondikeDealStrategy implements IDealStrategy {
    dealCards(deck: IDeck, columns: IColumn[]): void {
        // В Косынке карты раздаются в 7 колонок с нарастающим количеством карт
        // Первая колонка получает 1 карту, вторая - 2, и так далее до 7-й колонки
        
        for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
            const cardsInThisColumn = columnIndex + 1;
            
            for (let i = 0; i < cardsInThisColumn; i++) {
                const card = deck.drawCard();
                if (card) {
                    // Последняя карта в колонке должна быть видимой, остальные - скрытыми
                    const isLastCardInColumn = i === cardsInThisColumn - 1;
                    card.setVisible(isLastCardInColumn);
                    
                    columns[columnIndex].addCard(card);
                }
            }
        }
        
        // Оставшиеся карты остаются в колоде для последующего вытягивания
        // В Косынке колода обычно содержит 24 карты (52 - 28 разданных)
    }
}
