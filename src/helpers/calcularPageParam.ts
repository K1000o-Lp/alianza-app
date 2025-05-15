export const calcularPageParam = (id: number) => {
    return Math.floor(id / 24) * 24;
}