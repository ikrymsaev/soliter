import React from 'react';
import { useColumn, useColumnCards } from '@/core/react/hooks/useColumn';
import { useEmitEvent } from '@/core/react/hooks/useEventEmitter';
import { EGameEvent } from '@/core/lib/events';
import { DropZone } from '../DropZone';
import { Card } from '../Card';

interface Props {
    columnId: string;
}

export const ColumnCmp = ({ columnId }: Props) => {
    const column = useColumn(columnId);
    const cards = useColumnCards(columnId);
    const { emit } = useEmitEvent();

    if (!column) {
        return <div>Column not found</div>;
    }

    const handleSlotClick = () => {
        emit(EGameEvent.COLUMN_CLICK, { slot: column });
    }

    return (
        <div className="flex flex-col w-16 min-h-24 relative">
            {/* Отображаем карты в колонке */}
            {cards.map((card, index) => (
                <DropZone
                    key={`${card.cardType}-${card.cardSuit}-${index}`}
                    targetSlot={column}
                    className="relative"
                    style={{ 
                        marginTop: index === 0 ? 0 : -70,
                        zIndex: index + 1 // Первые карты имеют меньший z-index, последние - больший
                    }}
                >
                    <Card
                        card={card}
                        sourceSlot={column}
                        stackIndex={index}
                        isStackTop={index === cards.length - 1} // Верхняя карта в стопке
                    />
                </DropZone>
            ))}
            
            {/* Отображаем пустой слот */}
            {column.isEmpty() && (
                <DropZone
                    key={`empty-column-${columnId}`}
                    targetSlot={column}
                    className="w-16 h-24 border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-gray-400"
                    onClick={handleSlotClick}
                >
                    <span className="text-gray-400 text-xs">+</span>
                </DropZone>
            )}
        </div>
    )
}
