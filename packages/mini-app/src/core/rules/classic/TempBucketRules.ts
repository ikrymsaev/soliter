import type { ISlotRules } from "../interfaces";
import type { ITempBucket } from "../../interfaces";

export class TempBucketRules implements ISlotRules<ITempBucket> {
    canAcceptCard(tempBucket: ITempBucket, _card?: unknown): boolean {
        // Временный слот может принять карту, если есть свободное место
        return tempBucket.getAvailableSlots() > 0;
    }
}
