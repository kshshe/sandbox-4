import { Controls } from "../../classes/controls";
import { useState, useEffect } from "react";

export function useControls<TKey extends keyof typeof Controls.state>(control: TKey): [
    typeof Controls.state[TKey],
    (value: typeof Controls.state[TKey]) => void
] {
    const [localValue, setLocalValue] = useState(Controls.state[control]);

    useEffect(() => {
        return Controls.subscribe(control, (state) => setLocalValue(state[control]));
    }, [control]);

    useEffect(() => {
        Controls.setState(control, localValue);
    }, [localValue]);

    return [localValue, setLocalValue];
}