export function getTimeUnit (timeString) {
    let timeProperty = timeString.split(' ');
    let time = Number(timeProperty[0]);
    let unit = timeProperty[1];

    return {
        time: time,
        unit: unit
    }
}