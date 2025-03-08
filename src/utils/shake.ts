import { random } from "./random";

export function shake<T>(array: T[]): T[] {
    // Early return for empty or single-element arrays
    if (array.length <= 1) {
        return [...array];
    }
    
    const copy = [...array];
    let i = copy.length;
    
    // Fisher-Yates shuffle with optimized loop
    while (--i > 0) {
        const j = Math.floor(random() * (i + 1));
        // Swap without destructuring for better performance
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }
    
    return copy;
}