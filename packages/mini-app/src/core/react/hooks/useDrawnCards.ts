import { useObserve } from "./useObserve";
import { useController } from "./useController";

export const useDrawnCards = () => {
    const controller = useController();
    const game = controller.getGame();
    const drawnCardsArea = game.getDrawnCardsArea();
    
    if (!drawnCardsArea) {
        return null;
    }
    
    return drawnCardsArea;
};

export const useDrawnCardsCards = () => {
    const drawnCardsArea = useDrawnCards();
    
    if (!drawnCardsArea) {
        return [];
    }
    
    return useObserve(drawnCardsArea.getCardsObservable());
};

export const useDeckCardCount = () => {
    const controller = useController();
    const game = controller.getGame();
    return game.getDeck().getCardCount();
};
