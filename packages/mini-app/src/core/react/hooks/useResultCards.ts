import { ECardSuit } from "@/core/interfaces";
import { useController } from "./useController";
import { useObserve } from "./useObserve";

export const useResultSlot = (suit: ECardSuit) => {
    const controller = useController();
    const game = controller.getGame();

    const slots = game.getResult().getSlots();
    return slots[suit];
}

export const useResultSlotCards = (suit: ECardSuit) => {
    const slot = useResultSlot(suit);
    return useObserve(slot.getCards());
}