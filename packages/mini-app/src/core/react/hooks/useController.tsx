import { useContext } from "react";
import { ControllerContext } from "../providers/ControllerProvider";

export const useController = () => {
    const controller = useContext(ControllerContext);
    if (!controller) {
        throw new Error('Controller not found');
    }
    return controller;
}

/**
 * Хук для получения методов управления состояниями контроллера
 */
export const useControllerActions = () => {
    const controller = useController();
    
    return {
        setSelectedCard: controller.setSelectedCard,
        moveCard: controller.moveCard,
        moveCardFromDeckToSlot: controller.moveCardFromDeckToSlot,
        returnCardToDeck: controller.returnCardToDeck,
        drawCardFromDeck: controller.drawCardFromDeck,
        shuffleDeck: controller.shuffleDeck,
        restartDeck: controller.restartDeck,
        getAllSlots: controller.getAllSlots,
    };
};