import { random } from "./random";

export function shake<T>(array: T[]): T[] {
    if (array.length <= 1) {
        return [...array];
    }
    
    const copy = [...array];
    let i = copy.length;
    
    while (--i > 0) {
        const j = Math.floor(random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }
    
    return copy;
}