/**
 * This function generate time unit object from time string
 * Example
 *
 * getTimeUnit('1 days')
 * returns
 * {
 *   time: 1,
 *   unit: days
 * }
 *
 * @param timeString
 * @returns {{time: number, unit: *}}
 */
export function getTimeUnit (timeString) {
    let timeProperty = timeString.split(' ');
    let time = Number(timeProperty[0]);
    let unit = timeProperty[1];

    return {
        time: time,
        unit: unit
    }
}