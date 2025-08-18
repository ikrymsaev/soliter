import { useClicksState } from "@/core/react/hooks/useControllerStates";

export const ClicksState = () => {
    const clicks = useClicksState();

    return <div>Clicks: {clicks}</div>;
}
