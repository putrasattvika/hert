import moment from 'moment';

/**
 * Create moment object
 *
 * @param * {number} utc
 * @returns {*}
 */
export function createMoment(utc) {
    utc = utc || process.env.UTC;
    return moment().add(utc,'hours');
}

/**
 * Create date time string from given timestamp
 *
 * @param {number} timestamp
 * @returns (string}
 */
export function dateTimeFormatFromTimestamp(timestamp) {
    return moment(timestamp).format('YYYY-MM-DD HH:mm:SS')
}