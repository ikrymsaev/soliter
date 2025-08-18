import React from 'react';
import { useController } from '../core/react/hooks/useController';
import type { IColumn, IDeck, IResultSlot, ITempSlot } from '@/core/interfaces';

interface DropZoneProps {
    targetSlot: IColumn | ITempSlot | IDeck | IResultSlot;
    className?: string;
    children?: React.ReactNode;
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
        
        // Находим карту по данным
        const allSlots = controller.getAllSlots();
        let foundCard = null;
        let sourceSlot = null;
        
        for (const column of allSlots.columns) {
            const cards = column.getCards();
            foundCard = cards.find(card => card.getDisplayName() === cardData);
            if (foundCard) {
                sourceSlot = column;
                break;
            }
        }
        
        if (!foundCard) {
            for (const card of allSlots.temp.getCards()) {
                if (card.getDisplayName() === cardData) {
                    foundCard = card;
                    sourceSlot = allSlots.temp;
                    break;
                }
            }
        }
        
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
            const success = controller.moveCard(foundCard, targetSlot);
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
