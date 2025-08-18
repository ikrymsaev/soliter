import type { IGameRules } from "../interfaces/IGameRules";
import { ClassicSolitaireRules } from "./ClassicSolitaireRules";

export enum GameRulesType {
    CLASSIC_SOLITAIRE = "classic_solitaire",
    // Можно добавить другие варианты правил в будущем
    // SPIDER_SOLITAIRE = "spider_solitaire",
    // KLONDIKE = "klondike",
}

export class GameRulesFactory {
    /**
     * Создает экземпляр правил игры по типу
     */
    static createRules(rulesType: GameRulesType): IGameRules {
        switch (rulesType) {
            case GameRulesType.CLASSIC_SOLITAIRE:
                return new ClassicSolitaireRules();
            default:
                throw new Error(`Unknown game rules type: ${rulesType}`);
        }
    }
    
    /**
     * Получает доступные типы правил
     */
    static getAvailableRulesTypes(): GameRulesType[] {
        return Object.values(GameRulesType);
    }
}
