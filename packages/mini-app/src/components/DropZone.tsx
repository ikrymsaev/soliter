import React from 'react';
import { useController } from '@/core/react/hooks/useController';
import { Column } from '@/core/objects/Column';
import type { IColumn, IResultSlot, ITempBucket, ITempSlot, IDeck } from '@/core/interfaces';

interface DropZoneProps {
    targetSlot: IColumn | IResultSlot | ITempBucket | ITempSlot | IDeck;
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
                console.log(`[DropZone] Found card ${cardData} in column ${column.id} at index ${stackIndex}`);
                console.log(`[DropZone] Column cards:`, cards.map(c => c.getDisplayName()));
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
        
        if (foundCard && sourceSlot) {
            let success = false;
            
            // Если перетаскиваем стопку карт из колонки в колонку
            if (sourceSlot instanceof Column && targetSlot instanceof Column && stackIndex !== undefined) {
                console.log(`[DropZone] Attempting to move stack from index ${stackIndex}`);
                // Проверяем, можно ли переместить стопку
                if (sourceSlot.canMoveStack(stackIndex)) {
                    console.log(`[DropZone] Stack can be moved, calling moveStack`);
                    success = controller.moveStack(sourceSlot, stackIndex, targetSlot);
                } else {
                    console.log(`[DropZone] Stack cannot be moved, cannot move single card from middle of stack`);
                    success = false;
                }
            } else {
                console.log(`[DropZone] Not a column-to-column move, moving single card`);
                
                // Для перемещения в temp/result слоты проверяем, что карта является верхней в своей стопке
                if (sourceSlot instanceof Column && stackIndex !== undefined) {
                    const cards = sourceSlot.getCards();
                    const isTopCard = stackIndex === cards.length - 1;
                    
                    if (!isTopCard) {
                        console.log(`[DropZone] Card is not at top of stack, cannot move to temp/result`);
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
            console.log('[DropZone] Card not found or source slot not found');
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
