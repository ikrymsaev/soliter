import React from 'react';
import { cn } from '@/shared/utils/cn';
import { useEmitEvent } from '@/core/react/hooks/useEventEmitter';
import { useSelectedCard } from '@/core/react/hooks/useControllerStates';
import { EGameEvent } from '@/core/lib/events';
import type { ICard } from '@/core/interfaces';
import type { IColumn, IResultSlot, ITempSlot } from '@/core/interfaces';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  card: ICard;
  isSelected?: boolean;
  sourceSlot?: IColumn | IResultSlot | ITempSlot;
  isAvailable?: boolean;
  stackIndex?: number; // Индекс карты в стопке
  isStackTop?: boolean; // Является ли карта верхней в стопке
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isSelected = false, 
  className = '',
  sourceSlot,
  isAvailable = true,
  stackIndex = 0,
  isStackTop = true,
  ...props
}) => {
  const emitEvent = useEmitEvent();

  const selectedCard = useSelectedCard();
  const isActuallySelected = selectedCard === card;

  const [isDragging, setIsDragging] = React.useState(false);
  const [isBeingDragged, setIsBeingDragged] = React.useState(false);
  
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
    transition-opacity duration-200
  `;

  const colorClasses = suitInfo.color === 'red' ? 'text-red-600' : 'text-black';

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && isAvailable) {
      emitEvent.emit(EGameEvent.CARD_CLICK, { card });
      props.onClick?.(e);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Проверяем, можно ли перетаскивать стопку с этой карты
    if (sourceSlot && 'canMoveStack' in sourceSlot && typeof stackIndex === 'number') {
      const canMove = sourceSlot.canMoveStack(stackIndex);
      if (!canMove) {
        e.preventDefault();
        return;
      }
    }

    setIsDragging(true);
    setIsBeingDragged(true);
    
    // Устанавливаем данные для передачи - используем простой формат для обратной совместимости
    e.dataTransfer.setData('text/plain', card.getDisplayName());
    e.dataTransfer.effectAllowed = 'move';
    
    // Создаем drag image со всей стопкой карт
    if (sourceSlot && 'getMovableStack' in sourceSlot && typeof stackIndex === 'number') {
      const stack = sourceSlot.getMovableStack(stackIndex);
      if (stack.length > 1) {
        const dragContainer = document.createElement('div');
        dragContainer.style.position = 'absolute';
        dragContainer.style.top = '-1000px';
        dragContainer.style.left = '-1000px';
        dragContainer.style.pointerEvents = 'none';
        dragContainer.style.zIndex = '9999';
        
        // Создаем карты в стопке, используя ту же верстку что и в компоненте Card
        stack.forEach((stackCard, i) => {
          const cardElement = document.createElement('div');
          cardElement.className = `
            w-16 h-24 
            bg-white 
            border-2 border-gray-300 
            rounded-sm 
            flex flex-col
            shadow-md
            font-bold text-lg
            select-none
            absolute
          `;
          cardElement.style.top = `${i * 20}px`;
          cardElement.style.left = '0';
          cardElement.style.zIndex = (i + 1).toString();
          
          const cardInfo = stackCard.getCardTypeInfo();
          const suitInfo = stackCard.getCardSuitInfo();
          const color = suitInfo.color === 'red' ? '#dc2626' : '#000000';
          cardElement.style.color = color;
          
          cardElement.innerHTML = `
            <div class="text-xs p-1">${cardInfo.name}${suitInfo.name}</div>
          `;
          
          dragContainer.appendChild(cardElement);
        });
        
        document.body.appendChild(dragContainer);
        e.dataTransfer.setDragImage(dragContainer, 32, 48);
        
        // Удаляем элемент после начала перетаскивания
        setTimeout(() => {
          if (document.body.contains(dragContainer)) {
            document.body.removeChild(dragContainer);
          }
        }, 0);
      }
    }
    
    if (sourceSlot) {
      emitEvent.emit(EGameEvent.DRAG_START, { card, sourceSlot, stackIndex });
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
        { 'opacity-50': isBeingDragged }, // Скрываем карту во время перетаскивания
        className
      )}
      title={card.getDisplayName()}
      data-card="true"
      data-stack-index={stackIndex}
      data-is-stack-top={isStackTop}
      draggable={isAvailable ? 'true' : 'false'}
      onDragStart={handleDragStart}
      onDrag={(e) => {
        // Визуальная обратная связь при перетаскивании
        e.dataTransfer.dropEffect = 'move';
      }}
      onDragEnd={() => {
        // Добавляем небольшую задержку для сброса состояния
        setTimeout(() => {
          setIsDragging(false);
          setIsBeingDragged(false);
        }, 100);
        emitEvent.emit(EGameEvent.DRAG_END, { card });
      }}
      onClick={handleClick}
      style={{ 
        ...(props.style || {}),
        // Улучшаем отображение перетаскиваемой стопки
        zIndex: isBeingDragged ? 1000 : 'auto'
      }}
    >
      <div className="text-xs p-1">{cardInfo.name}{suitInfo.name}</div>
    </div>
  );
};
