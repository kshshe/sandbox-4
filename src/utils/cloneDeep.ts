export const cloneDeep = <T>(obj: T): T => {
    if (typeof obj !== 'object' || obj === null) {
        return obj
    }
    const copy: Partial<T> = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            copy[key] = cloneDeep(obj[key])
        } else {
            copy[key] = obj[key]
        }
    }
    return copy as T
}
