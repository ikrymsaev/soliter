import type { IGameRules } from "../interfaces/IGameRules";
import { ClassicRules } from "./classic/ClassicRules";

export enum ESolitaireRules {
    CLASSIC = "classic",
    KLONDIKE = "klondike",
    // SPIDER = "spider",
}

export class GameRulesFactory {
    /**
     * Создает экземпляр правил игры по типу
     */
    static createRules(rulesType: ESolitaireRules): IGameRules {
        switch (rulesType) {
            case ESolitaireRules.CLASSIC:
                return new ClassicRules();
            default:
                throw new Error(`Unknown game rules type: ${rulesType}`);
        }
    }
    
    /**
     * Получает доступные типы правил
     */
    static getAvailableRulesTypes(): ESolitaireRules[] {
        return Object.values(ESolitaireRules);
    }
}
