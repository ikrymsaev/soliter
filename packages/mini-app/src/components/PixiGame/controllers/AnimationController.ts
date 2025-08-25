import * as PIXI from 'pixi.js';
import type { AnimationLayer } from '../layers/AnimationLayer';
import type { Controller } from '@/core/GameController';
import type { ICard } from '@/core/interfaces';
import { Card } from '../objects/Card';

export interface AnimationConfig {
    duration?: number; // в миллисекундах
    easing?: 'linear' | 'easeInOut' | 'easeOut';
}

export interface CardAnimationData {
    card: ICard;
    fromPosition: PIXI.Point;
    toPosition: PIXI.Point;
    onComplete?: () => void;
    config?: AnimationConfig;
}

export class AnimationController {
    private activeAnimations: Map<string, PIXI.Ticker> = new Map();
    private animationQueue: CardAnimationData[] = [];
    private isProcessingQueue = false;

    private readonly DEFAULT_CONFIG: Required<AnimationConfig> = {
        duration: 300,
        easing: 'easeOut'
    };

    constructor(
        private readonly animationLayer: AnimationLayer,
        private readonly pixiEmitter: PIXI.EventEmitter,
        private readonly gameController: Controller
    ) {}

    /**
     * Анимирует перемещение карты от одной позиции к другой
     */
    animateCardMove(data: CardAnimationData): void {
        this.animationQueue.push(data);
        this.processQueue();
    }

    /**
     * Анимирует перемещение нескольких карт одновременно
     */
    animateCardsMove(cards: CardAnimationData[]): void {
        this.animationQueue.push(...cards);
        this.processQueue();
    }

    /**
     * Останавливает все активные анимации
     */
    stopAllAnimations(): void {
        this.activeAnimations.forEach((ticker, animationId) => {
            ticker.destroy();
        });
        this.activeAnimations.clear();
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        // Очищаем анимационный слой
        this.animationLayer.removeChildren();
    }

    /**
     * Проверяет, есть ли активные анимации
     */
    hasActiveAnimations(): boolean {
        return this.activeAnimations.size > 0 || this.animationQueue.length > 0;
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.animationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.animationQueue.length > 0) {
            const animationData = this.animationQueue.shift()!;
            await this.executeCardAnimation(animationData);
        }

        this.isProcessingQueue = false;
    }

    private executeCardAnimation(data: CardAnimationData): Promise<void> {
        return new Promise((resolve) => {
            const config = { ...this.DEFAULT_CONFIG, ...data.config };
            const animationId = this.generateAnimationId(data.card);

            // Создаем визуальную копию карты для анимации
            const animatedCard = new Card(data.card, this.gameController, this.pixiEmitter);
            animatedCard.x = data.fromPosition.x;
            animatedCard.y = data.fromPosition.y;
            
            // Добавляем карту в анимационный слой
            this.animationLayer.addChild(animatedCard);

            // Создаем тикер для анимации
            const ticker = new PIXI.Ticker();
            const startTime = Date.now();
            const deltaX = data.toPosition.x - data.fromPosition.x;
            const deltaY = data.toPosition.y - data.fromPosition.y;

            ticker.add(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / config.duration, 1);
                
                // Применяем функцию плавности
                const easedProgress = this.applyEasing(progress, config.easing);
                
                // Обновляем позицию карты
                animatedCard.x = data.fromPosition.x + deltaX * easedProgress;
                animatedCard.y = data.fromPosition.y + deltaY * easedProgress;

                // Проверяем завершение анимации
                if (progress >= 1) {
                    this.completeAnimation(animationId, animatedCard, data.onComplete, resolve);
                }
            });

            // Сохраняем тикер и запускаем анимацию
            this.activeAnimations.set(animationId, ticker);
            ticker.start();
        });
    }

    private completeAnimation(
        animationId: string, 
        animatedCard: Card, 
        onComplete?: () => void,
        resolve?: () => void
    ): void {
        // Останавливаем и удаляем тикер
        const ticker = this.activeAnimations.get(animationId);
        if (ticker) {
            ticker.destroy();
            this.activeAnimations.delete(animationId);
        }

        // Удаляем анимированную карту из слоя
        if (animatedCard.parent === this.animationLayer) {
            this.animationLayer.removeChild(animatedCard);
            animatedCard.destroy();
        }

        // Вызываем callback завершения
        if (onComplete) {
            onComplete();
        }

        // Разрешаем промис
        if (resolve) {
            resolve();
        }
    }

    private applyEasing(progress: number, easing: 'linear' | 'easeInOut' | 'easeOut'): number {
        switch (easing) {
            case 'linear':
                return progress;
            case 'easeInOut':
                return progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            case 'easeOut':
                return 1 - Math.pow(1 - progress, 3);
            default:
                return progress;
        }
    }

    private generateAnimationId(card: ICard): string {
        return `card_${card.getDisplayName()}_${Date.now()}_${Math.random()}`;
    }
}
