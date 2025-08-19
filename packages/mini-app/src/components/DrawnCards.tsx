import { useEmitEvent } from "@/core/react/hooks/useEventEmitter";
import { useDrawnCardsCards, useDeckCardCount, useDrawnCards } from "@/core/react/hooks/useDrawnCards";
import { EGameEvent } from "@/core/lib/events";
import { Card } from "./Card";

export const DrawnCards = () => {
    const { emit } = useEmitEvent();
    const deckCardCount = useDeckCardCount();
    const drawnCards = useDrawnCardsCards();
    const drawnCardsArea = useDrawnCards();
    
    const handleDeckClick = () => {
        emit(EGameEvent.DECK_CLICK, {});
    }
    
    const isDeckEmpty = deckCardCount === 0;
    const hasDrawnCards = drawnCards.length > 0;
    
    return (
        <div id="drawn-cards" className="flex flex-row items-center gap-2">
            {/* Кнопка колоды для вытягивания карт */}
            <div 
                className={`w-16 h-24 border-2 rounded-sm flex items-center justify-center cursor-pointer ${
                    isDeckEmpty && hasDrawnCards 
                        ? 'border-green-400 bg-green-50 hover:border-green-500' 
                        : 'border-gray-300 bg-blue-50 hover:border-gray-400'
                }`}
                onClick={handleDeckClick}
            >
                <div className="text-center">
                    <div className="text-xs text-gray-600">
                        {isDeckEmpty && hasDrawnCards ? 'Начать заново' : 'Колода'}
                    </div>
                    <div className="text-lg font-bold text-gray-800">{deckCardCount}</div>
                </div>
            </div>
            {drawnCards.length > 0 ? (
                // Показываем последнюю вытянутую карту
                <Card
                    card={drawnCards[drawnCards.length - 1]}
                    sourceSlot={drawnCardsArea!}
                    isStackTop={true}
                />
            ) : (
                // Показываем пустую область для вытянутых карт
                <div className="w-16 h-24 border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400 text-xs">Пусто</span>
                </div>
            )}
        </div>
    )
}
