import type { ITempSlot } from "../../interfaces";
import type { ISlotRules } from "../interfaces";

export class TempSlotRules implements ISlotRules<ITempSlot> {
    canAcceptCard(tempSlot: ITempSlot): boolean {
        // Временный слот может принять карту только если он пустой
        return tempSlot.isEmpty();
    }

    canInteractWithCard(_tempSlot: ITempSlot, _card?: unknown): boolean {
        return true;
    }

    canInteractWithStack(_tempSlot: ITempSlot, _card?: unknown): boolean {
        // Временные слоты не поддерживают взаимодействие со стопкой
        return false;
    }
}
