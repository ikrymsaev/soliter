import { DrawnCards } from "../DrawnCards"
import { Desk } from "../Desk"
import { ResultCmp } from "../ResultBucket/ResultBucket"

export const KlondikeLayout = () => {
    return (
        <div className="flex flex-col flex-grow w-full gap-10">
            <div className="flex flex-row justify-between">
                <DrawnCards />
                <ResultCmp />
            </div>
            <div className="flex flex-row justify-between">
                <Desk />
            </div>
        </div>
    )
}