import { useTempSlot, useTempSlotCard } from "@/core/react/hooks/useTempBucket";
import { DropZone } from "../DropZone";
import { Card } from "../Card";
import { useEmitEvent } from "@/core/react/hooks/useEventEmitter";
import { EGameEvent } from "@/core/lib/events";

export const TempSlot = ({ index }: { index: number }) => {
    const slot = useTempSlot(index);
    const card = useTempSlotCard(index);
    const { emit } = useEmitEvent();

    const handleSlotClick = () => {
        emit(EGameEvent.TEMP_BUCKET_CLICK, { slot: slot });
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Отображаем карту в слоте */}
            {!!card && (
                <DropZone
                    key={`${card.cardType}-${card.cardSuit}-${index}`}
                    targetSlot={slot}
                    className=""
                >
                    <Card
                        card={card}
                        sourceSlot={slot}
                    />
                </DropZone>
            )}
            
            {/* Отображаем пустой слот */}
            {slot.isEmpty() && (
                <DropZone
                    key={`empty-temp-${index}`}
                    targetSlot={slot}
                    className="w-16 h-24 border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-gray-400"
                    onClick={handleSlotClick}
                >
                    <span className="text-gray-400 text-xs">+</span>
                </DropZone>
            )}
        </div>
    )
}
