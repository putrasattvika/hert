import moment from 'moment';

/**
 * Create moment object
 *
 * @param * utc
 * @returns {*}
 */
export function createMoment(utc) {
    utc = utc || process.env.UTC;
    return moment().add(utc,'hours');
}