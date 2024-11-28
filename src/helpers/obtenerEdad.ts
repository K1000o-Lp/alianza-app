import dayjs from "dayjs";

export const obtenerEdad = (fecha: Date | null): number|null => {
    if (!fecha) return null;

    const fechaNacimiento = dayjs(fecha);
    const hoy = dayjs();
    let edad = hoy.year() - fechaNacimiento.year();
    const mesActual = hoy.month();
    const mesNacimiento = fechaNacimiento.month();
    const diaActual = hoy.day();
    const diaNacimiento = fechaNacimiento.day();

    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
        edad--;
    }
    
    return edad;
}