import React from 'react';
import type { ICard, IColumn, IResultSlot, ITempSlot } from '../core/interfaces';
import { useEmitEvent } from '../core/react/hooks/useEventEmitter';
import { EGameEvent } from '../core/lib/events';
import { cn } from '@/shared/utils/cn';
import { useSelectedCard } from '@/core/react/hooks';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  card: ICard;
  isSelected?: boolean;
  className?: string;
  sourceSlot?: IColumn | IResultSlot | ITempSlot;
  isAvailable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isSelected = false, 
  className = '',
  sourceSlot,
  isAvailable = true,
  ...props
}) => {
  const emitEvent = useEmitEvent();

  const selectedCard = useSelectedCard();
  const isActuallySelected = selectedCard === card;

  const [isDragging, setIsDragging] = React.useState(false);
  
  const cardInfo = card.getCardTypeInfo();
  const suitInfo = card.getCardSuitInfo();

  const baseClasses = `
    w-16 h-24 
    bg-white 
    border-2 border-gray-300 
    rounded-sm 
    flex flex-col
    cursor-grab 
    shadow-md
    font-bold text-lg
    select-none
  `;

  const colorClasses = suitInfo.color === 'red' ? 'text-red-600' : 'text-black';

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && props.onClick && isAvailable) {
      props.onClick(e);
    }
  };

  return (
    <div 
      className={cn(
        baseClasses,
        colorClasses,
        { 'border-blue-500 shadow-lg': isSelected || isActuallySelected },
        { 'hover:border-gray-400 hover:shadow-lg': isAvailable },
        { 'cursor-default': !isAvailable },
        className
      )}
      title={card.getDisplayName()}
      data-card="true"
      draggable={isAvailable ? 'true' : 'false'}
      onDragStart={(e) => {
        setIsDragging(true);
        
        // Устанавливаем данные для передачи
        e.dataTransfer.setData('text/plain', card.getDisplayName());
        e.dataTransfer.effectAllowed = 'move';
        
        if (sourceSlot) {
          emitEvent.emit(EGameEvent.DRAG_START, { card, sourceSlot });
        }
      }}
      onDrag={(e) => {
        // Визуальная обратная связь при перетаскивании
        e.dataTransfer.dropEffect = 'move';
      }}
      onDragEnd={() => {
        // Добавляем небольшую задержку для сброса состояния
        setTimeout(() => setIsDragging(false), 100);
        emitEvent.emit(EGameEvent.DRAG_END, { card });
      }}
      onClick={handleClick}
      style={{ 
        ...(props.style || {})
      }}
    >
      <div className="text-xs p-1">{cardInfo.name}{suitInfo.name}</div>
    </div>
  );
};
