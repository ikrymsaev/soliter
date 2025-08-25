import type { ICard } from "../../interfaces";
import type { ISlotRules } from "../interfaces";
import type { ITempBucket } from "../../interfaces";

export class KlondikeTempBucketRules implements ISlotRules<ITempBucket> {
    canAcceptCard(tempBucket: ITempBucket, card?: ICard): boolean {
        // В пасьянсе Косынка временные слоты (foundation piles) могут принимать только королей
        // или быть пустыми для временного хранения карт
        if (!card) return false;
        
        // Можно положить короля в пустой слот
        if (tempBucket.isEmpty()) {
            return card.cardType === 'K';
        }
        
        // Если слот не пустой, нельзя класть карты
        return false;
    }

    canInteractWithCard(_tempBucket: ITempBucket, _card?: ICard): boolean {
        return true;
    }

    canInteractWithStack(_tempBucket: ITempBucket, _card?: ICard): boolean {
        // Временные слоты не поддерживают взаимодействие со стопкой
        return false;
    }
}
