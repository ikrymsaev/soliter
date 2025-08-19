import type { IColumn, IResultSlot, ITempBucket } from "@/core/interfaces";
import type { IGameRules } from "../../interfaces/IGameRules";
import type { ISlotRules } from "../interfaces";

export class KlondikeRules implements IGameRules {
    readonly columnRules: ISlotRules<IColumn>;
    readonly resultSlotRules: ISlotRules<IResultSlot>;
    readonly tempBucketRules: ISlotRules<ITempBucket>;

    constructor() {
        this.columnRules = new ColumnRules();
        this.resultSlotRules = new ResultSlotRules();
        this.tempBucketRules = new TempBucketRules();
    }
}