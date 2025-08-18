import type { ECardSuit } from "@/core/interfaces";
import { useResultSlot, useResultSlotCards } from "@/core/react/hooks/useResultCards";
import { DropZone } from "../DropZone";
import { Card } from "../Card";

export const ResultSlot = ({ suit }: { suit: ECardSuit }) => {
    const slot = useResultSlot(suit);
    const cards = useResultSlotCards(suit);
    const lastCard = cards.at(-1);

    return (
        <div className="flex flex-col gap-2">
            {/* Отображаем карты в слоте */}
            {!!lastCard && (
                <DropZone
                    key={`${lastCard.cardType}-${lastCard.cardSuit}`}
                    targetSlot={slot}
                    className=""
                >
                    <Card
                        card={lastCard}
                        sourceSlot={slot}
                    />
                </DropZone>
            )}
            
            {/* Отображаем пустой слот */}
            {slot.isEmpty() && (
                <DropZone
                    key={`empty-${suit}`}
                    targetSlot={slot}
                    className="w-16 h-24 border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-gray-400"
                >
                    <span className="text-gray-400 text-xs">+</span>
                </DropZone>
            )}
        </div>
    )
}