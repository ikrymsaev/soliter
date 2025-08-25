import { EPixiEvent } from "../events";
import type { DragLayer } from "../layers/DragLayer";
import * as PIXI from "pixi.js"
import { findTargetSlot } from "../utils";
import { CardStack } from "../objects/CardStack";

type DragStartEvent = {
    element: PIXI.Container;
    event: PIXI.FederatedPointerEvent;
}
const DEFAULT_POSITION = { x: 0, y: 0 };

export class DragController {
    private readonly DRAG_THRESHOLD = 5;
    
    private draggedEl: PIXI.Container | null = null;
    private draggedStack: CardStack | null = null;
    private source: PIXI.Container | null = null;

    private dragOffset = DEFAULT_POSITION;
    private originalPosition = DEFAULT_POSITION;
    private dragStartPosition = DEFAULT_POSITION;

    private isDragging = false;
    private isDragStarted = false;

    constructor(
        private readonly dragLayer: DragLayer,
        private readonly pixiEmitter: PIXI.EventEmitter,
        private readonly gameController?: any
    ) {}
    
    startDrag = (data: DragStartEvent) => {
        if (this.isDragging) return;

        const { element, event } = data;
        
        this.source = element.parent;
        this.dragStartPosition = { x: event.global.x, y: event.global.y };
        this.isDragStarted = true;
        this.draggedEl = element;

        if (!element) {
            this.isDragStarted = false;
            this.source = null;
            this.draggedEl = null;
            return;
        }

        this.originalPosition = { x: element.x, y: element.y };
        this.addGlobalEventListeners();
    }

    getDragInfo() {
        return {
            draggedEl: this.draggedEl,
            draggedStack: this.draggedStack,
            source: this.source,
            originalPosition: this.originalPosition,
            isDragging: this.isDragging
        };
    }

    restoreElement = () => {
        if (this.draggedEl && this.source) {
            // Удаляем элемент из dragLayer если он там находится
            if (this.draggedEl.parent === this.dragLayer) {
                this.dragLayer.removeChild(this.draggedEl);
            }
            
            // Если была стопка, восстанавливаем видимость всех карт и удаляем CardStack
            if (this.draggedStack && this.draggedStack.parent === this.dragLayer) {
                // Восстанавливаем видимость всех карт стопки
                if (this.gameController) {
                    const selectedStack = this.gameController.selectedStack.get();
                    if (selectedStack) {
                        this.showStackCards(selectedStack);
                    }
                }
                
                this.dragLayer.removeChild(this.draggedStack);
                this.draggedStack.destroy();
            }
            
            // Всегда возвращаем оригинальную карту в исходный контейнер
            this.source.addChild(this.draggedEl);
            this.draggedEl.x = this.originalPosition.x;
            this.draggedEl.y = this.originalPosition.y;
            this.draggedEl.visible = true; // Восстанавливаем видимость
            
            // Сбрасываем состояние перетаскивания
            this.isDragging = false;
            this.isDragStarted = false;
            this.draggedEl = null;
            this.draggedStack = null;
            this.source = null;
            this.originalPosition = DEFAULT_POSITION;
            this.dragOffset = DEFAULT_POSITION;
            
            // Отключаем интерактивность DragLayer
            this.dragLayer.eventMode = 'none';
            
            // Удаляем глобальные обработчики
            this.removeGlobalEventListeners();
        }
    }

    endDrag = () => {
        this.removeGlobalEventListeners();
        if (!this.isDragging) return;

        // Удаляем перетаскиваемую карту из dragLayer
        if (this.draggedEl && this.draggedEl.parent === this.dragLayer) {
            this.dragLayer.removeChild(this.draggedEl);
        }

        // Удаляем стопку карт из dragLayer (карты уже перемещены игровой логикой)
        if (this.draggedStack && this.draggedStack.parent === this.dragLayer) {
            this.dragLayer.removeChild(this.draggedStack);
            this.draggedStack.destroy();
        }

        // Отключаем интерактивность DragLayer
        this.dragLayer.eventMode = 'none';
        
        // Сбрасываем состояние
        this.isDragging = false;
        this.isDragStarted = false;
        this.draggedEl = null;
        this.draggedStack = null;
        this.source = null;
        this.originalPosition = DEFAULT_POSITION;
        this.dragOffset = DEFAULT_POSITION;
    }

    completeDrag = () => {
        // Завершает перетаскивание без восстановления карты
        // (карта уже перемещена в новое место через игровую логику)
        this.removeGlobalEventListeners();
        
        // Удаляем карту из dragLayer если она там
        if (this.draggedEl && this.draggedEl.parent === this.dragLayer) {
            this.dragLayer.removeChild(this.draggedEl);
        }

        // Удаляем стопку карт из dragLayer (карты уже перемещены игровой логикой)
        if (this.draggedStack && this.draggedStack.parent === this.dragLayer) {
            this.dragLayer.removeChild(this.draggedStack);
            this.draggedStack.destroy();
        }

        // Отключаем интерактивность DragLayer
        this.dragLayer.eventMode = 'none';
        
        // Сбрасываем состояние
        this.isDragging = false;
        this.isDragStarted = false;
        this.draggedEl = null;
        this.draggedStack = null;
        this.source = null;
        this.originalPosition = DEFAULT_POSITION;
        this.dragOffset = DEFAULT_POSITION;
    }

    private updateDragPosition(globalX: number, globalY: number) {
        const newX = globalX - this.dragOffset.x;
        const newY = globalY - this.dragOffset.y;
        
        // Если есть стопка, перемещаем её
        if (this.draggedStack) {
            this.draggedStack.x = newX;
            this.draggedStack.y = newY;
        }
        
        // Если есть одиночная карта, перемещаем её
        if (this.draggedEl) {
            this.draggedEl.x = newX;
            this.draggedEl.y = newY;
        }
    }

    private addGlobalEventListeners() {
        document.addEventListener('mousemove', this.onGlobalMouseMove);
        document.addEventListener('mouseup', this.onGlobalMouseUp);
    }

    private removeGlobalEventListeners() {
        document.removeEventListener('mousemove', this.onGlobalMouseMove);
        document.removeEventListener('mouseup', this.onGlobalMouseUp);
    }
    
    private onGlobalMouseMove = (event: MouseEvent) => {
        // Конвертируем координаты мыши в координаты PIXI
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const pixiX = event.clientX - rect.left;
        const pixiY = event.clientY - rect.top;
        
        // Если перетаскивание уже началось
        if (this.isDragging && this.draggedEl) {
            this.updateDragPosition(pixiX, pixiY);
            
            // Эмитим событие перетаскивания для подсветки возможных зон сброса
            this.pixiEmitter.emit(EPixiEvent.DragOver, {
                targetSlot: findTargetSlot(this.dragLayer, new PIXI.Point(pixiX, pixiY)),
                event: event
            });
            return;
        }
        
        // Если перетаскивание подготовлено, но еще не началось
        if (this.isDragStarted && this.draggedEl) {
            // Проверяем, достаточно ли мышь сдвинулась для начала перетаскивания
            const distance = Math.sqrt(
                Math.pow(pixiX - this.dragStartPosition.x, 2) + 
                Math.pow(pixiY - this.dragStartPosition.y, 2)
            );
            
            if (distance >= this.DRAG_THRESHOLD) {
                this.beginActualDrag(pixiX, pixiY);
            }
        }
    };

    private beginActualDrag(pixiX: number, pixiY: number) {
        if (!this.draggedEl) return;

        this.isDragging = true;
        this.isDragStarted = false;

        // Вычисляем смещение от точки клика до позиции карты
        const globalPos = this.draggedEl.toGlobal(new PIXI.Point(0, 0));
        this.dragOffset = {
            x: pixiX - globalPos.x,
            y: pixiY - globalPos.y
        };
        
        // Проверяем, что смещение разумное
        if (Math.abs(this.dragOffset.x) > 100 || Math.abs(this.dragOffset.y) > 100) {
            this.dragOffset = { x: 30, y: 45 }; // Центрируем карту под курсором
        }

        // Проверяем, есть ли выбранная стопка
        if (this.gameController) {
            const selectedStack = this.gameController.selectedStack.get();
            if (selectedStack && selectedStack.length > 1) {
                // Создаем CardStack для визуализации стопки
                this.draggedStack = new CardStack(selectedStack, this.gameController, this.pixiEmitter);
                this.dragLayer.addChild(this.draggedStack);
                
                // Скрываем все карты стопки в исходной колонке
                this.hideStackCards(selectedStack);
            } else {
                // Обычное перетаскивание одной карты
                this.dragLayer.addChild(this.draggedEl);
            }
        } else {
            // Обычное перетаскивание одной карты
            this.dragLayer.addChild(this.draggedEl);
        }
        
        // Позиционируем перетаскиваемый элемент
        this.updateDragPosition(pixiX, pixiY);
        // Включаем интерактивность DragLayer для перехвата событий мыши
        this.dragLayer.eventMode = 'static';
    }

    private onGlobalMouseUp = (event: MouseEvent) => {
        // Если перетаскивание не началось, просто отменяем подготовку
        if (!this.isDragging && !this.isDragStarted) return;
        
        // Если перетаскивание только подготовлено, но не началось - это обычный клик
        if (this.isDragStarted && !this.isDragging) {
            this.cancelDragPreparation();
            return;
        }
        
        // Конвертируем координаты мыши в координаты PIXI
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const pixiX = event.clientX - rect.left;
        const pixiY = event.clientY - rect.top;
        
        this.pixiEmitter.emit(EPixiEvent.DragDrop, {
            element: this.draggedEl,
            source: this.source,
            targetPoint: new PIXI.Point(pixiX, pixiY)
        });

        this.cancelDragPreparation();
    };

    private hideStackCards(selectedStack: any[]) {
        if (!this.source) return;
        
        // Находим все визуальные карты в источнике, которые соответствуют стопке
        selectedStack.forEach((cardData: any) => {
            const pixiCard = this.source!.children.find((child: any) => 
                child.data === cardData
            );
            if (pixiCard) {
                pixiCard.visible = false;
            }
        });
    }

    private showStackCards(selectedStack: any[]) {
        if (!this.source) return;
        
        // Восстанавливаем видимость всех карт стопки
        selectedStack.forEach((cardData: any) => {
            const pixiCard = this.source!.children.find((child: any) => 
                child.data === cardData
            );
            if (pixiCard) {
                pixiCard.visible = true;
            }
        });
    }

    private cancelDragPreparation() {
        // Удаляем глобальные обработчики событий
        this.removeGlobalEventListeners();
        
        // Сбрасываем состояние подготовки (но НЕ восстанавливаем карту)
        this.isDragStarted = false;
        this.isDragging = false;
        this.draggedEl = null;
        this.draggedStack = null;
        this.source = null;
        this.originalPosition = DEFAULT_POSITION;
        this.dragOffset = DEFAULT_POSITION;
    }
}