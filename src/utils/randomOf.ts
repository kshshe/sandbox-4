export const randomOf = <T>(array: T[]) => {
    return array[Math.floor(Math.random() * array.length)]
}