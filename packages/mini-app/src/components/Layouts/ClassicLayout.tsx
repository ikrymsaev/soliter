import { Desk } from "../Desk"
import { ResultCmp } from "../ResultBucket/ResultBucket"
import { TempBucketCmp } from "../TempBucket/TempBucket"

export const ClassicLayout = () => {
    return (
        <div className="flex flex-col flex-grow w-full gap-10">
            <div className="flex flex-row justify-between">
                <TempBucketCmp />
                <ResultCmp />
            </div>
            <div className="flex flex-row justify-between">
                <Desk />
            </div>
        </div>
    )
}