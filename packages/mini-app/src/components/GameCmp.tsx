import type { Game } from "../core/Game";
import { Desk } from "./Desk";
import { ResultCmp } from "./ResultBucket/ResultBucket";
import { useEmitEvent } from "@/core/react/hooks/useEventEmitter";
import { EGameEvent } from "@/core/lib/events";
import { ClicksState } from "./test-components/ClicksState";
import { TempBucketCmp } from "./TempBucket/TempBucket";

interface Props {
    game: Game;
}

export const GameCmp = ({ game }: Props) => {
    const { emit } = useEmitEvent();

    const handleOutsideClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-card]') && !target.closest('[data-slot]')) {
            emit(EGameEvent.CLICK_OUTSIDE, {});
        }
    };

    const handleGameDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleGameDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleGameDragEnd = (e: React.DragEvent) => {
        e.preventDefault();
        const cardData = e.dataTransfer.getData('text/plain');
        if (cardData) {
            const allSlots = game.getAllSlots();
            let foundCard = null;
            
            for (const column of allSlots.columns) {
                const cards = column.getCards();
                foundCard = cards.find(card => card.getDisplayName() === cardData);
                if (foundCard) break;
            }
            
            if (!foundCard) {
                for (const card of allSlots.temp.getCards()) {
                    if (card.getDisplayName() === cardData) {
                        foundCard = card;
                        break;
                    }
                }
            }
            
            if (!foundCard) {
                for (const slot of allSlots.result) {
                    for (const card of slot.getCards().get()) {
                        if (card.getDisplayName() === cardData) {
                            foundCard = card;
                            break;
                        }
                    }
                    if (foundCard) break;
                }
            }
            
            if (foundCard) {
                emit(EGameEvent.DRAG_END, { card: foundCard });
            }
        }
    };

    return (
        <div 
            className="flex flex-col p-10 gap-10 min-h-screen bg-emerald-700"
            onClick={handleOutsideClick}
            onDragEnter={handleGameDragEnter}
            onDragOver={handleGameDragOver}
            onDragEnd={handleGameDragEnd}
        >
            <div className="flex flex-row justify-between">
                <TempBucketCmp />
                <ResultCmp />
            </div>
            <div className="flex flex-row justify-between">
                <Desk />
            </div>
            <ClicksState />
        </div>
    )
}