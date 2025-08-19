import React from 'react';
import { useController } from '@/core/react/hooks/useController';
import { Column } from '@/core/objects/Column';
import type { IColumn, IResultSlot, ITempBucket, ITempSlot, IDeck } from '@/core/interfaces';
import type { IDrawnCardsArea } from '@/core/interfaces/IDrawnCardsArea';

interface DropZoneProps {
    targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck | IDrawnCardsArea;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
    targetSlot, 
    className = '',
    children,
    onClick,
    style
}) => {
    const controller = useController();
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleDragOverEvent = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDropEvent = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const cardData = e.dataTransfer.getData('text/plain');
        
        if (!cardData) {
            return;
        }
        
        // Находим карту и исходный слот
        const allSlots = controller.getAllSlots();
        let foundCard = null;
        let sourceSlot = null;
        let stackIndex = 0;
        
        // Ищем в колонках
        for (const column of allSlots.columns) {
            const cards = column.getCards();
            foundCard = cards.find(card => card.getDisplayName() === cardData);
            if (foundCard) {
                sourceSlot = column;
                stackIndex = cards.indexOf(foundCard);
                break;
            }
        }
        
        // Ищем в временных слотах
        if (!foundCard) {
            for (const card of allSlots.temp.getCards()) {
                if (card.getDisplayName() === cardData) {
                    foundCard = card;
                    sourceSlot = allSlots.temp;
                    break;
                }
            }
        }
        
        // Ищем в результирующих слотах
        if (!foundCard) {
            for (const slot of allSlots.result) {
                for (const card of slot.getCards().get()) {
                    if (card.getDisplayName() === cardData) {
                        foundCard = card;
                        sourceSlot = slot;
                        break;
                    }
                }
                if (foundCard) break;
            }
        }
        
        // Ищем в области вытянутых карт
        if (!foundCard && allSlots.drawnCardsArea) {
            const drawnCards = allSlots.drawnCardsArea.getCards();
            foundCard = drawnCards.find(card => card.getDisplayName() === cardData);
            if (foundCard) {
                sourceSlot = allSlots.drawnCardsArea;
            }
        }
        
        if (foundCard && sourceSlot) {
            let success = false;
            
            // Если перетаскиваем стопку карт из колонки в колонку
            if (sourceSlot instanceof Column && targetSlot instanceof Column && stackIndex !== undefined) {
                // Проверяем, можно ли переместить стопку
                if (sourceSlot.canMoveStack(stackIndex)) {
                    success = controller.moveStack(sourceSlot, stackIndex, targetSlot);
                } else {
                    success = false;
                }
            } else {
                if (sourceSlot instanceof Column && stackIndex !== undefined) {
                    const cards = sourceSlot.getCards();
                    const isTopCard = stackIndex === cards.length - 1;
                    
                    if (!isTopCard) {
                        success = false;
                    } else {
                        // Обычное перемещение одной карты
                        success = controller.moveCard(foundCard as any, targetSlot);
                    }
                } else {
                    // Обычное перемещение одной карты
                    success = controller.moveCard(foundCard as any, targetSlot);
                }
            }
            
            if (success) {
                e.dataTransfer.dropEffect = 'move';
            } else {
                e.dataTransfer.dropEffect = 'none';
            }
        } else {
            e.dataTransfer.dropEffect = 'none';
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Проверяем, что мы действительно покидаем элемент, а не переходим к дочернему
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    };

    const dragOverClasses = isDragOver ? 'drop-shadow-lg' : '';
    
    return (
        <div
            className={`${className} ${dragOverClasses}`}
            style={style}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOverEvent}
            onDrop={handleDropEvent}
            onDragLeave={handleDragLeave}
            onClick={onClick}
            data-slot="true"
        >
            {children}
        </div>
    );
};
