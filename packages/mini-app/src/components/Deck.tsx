import type { IDeck } from "@/core/interfaces";
import { useEmitEvent } from "@/core/react/hooks/useEventEmitter";
import { EGameEvent } from "@/core/lib/events";
import { DropZone } from "./DropZone";

interface Props {
    deck: IDeck;
}

export const Deck = ({ deck }: Props) => {
    const { emit } = useEmitEvent();
    const cards = deck.getCards();
    
    const handleDeckClick = () => {
        emit(EGameEvent.DECK_CLICK, {});
    }
    
    return (
        <div id="deck" className="flex flex-col items-center gap-2">
            <DropZone
                targetSlot={deck}
                className="w-16 h-24 border-2 border-gray-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-gray-400 bg-blue-50"
                onClick={handleDeckClick}
            >
                <div className="text-center">
                    <div className="text-xs text-gray-600">Колода</div>
                    <div className="text-lg font-bold text-gray-800">{cards.length}</div>
                </div>
            </DropZone>
        </div>
    )
}
