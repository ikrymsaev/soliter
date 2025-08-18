import type { IColumn } from "./IColumn";
import type { IDeck } from "./IDeck";

export interface IField {
    getSlots(): IColumn[];
}
