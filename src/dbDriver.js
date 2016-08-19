import * as eslib from './lib/elasticsearch';
import * as constants from './utils/constants';

/**
 * Return DB query builder depends on config
 *
 * @param config
 * @returns {--global-type--}
 */
export function getDbDriver(config) {
    if (config.source === constants.SOURCE_TYPE.elasticsearch) {
        return eslib;
    }
}


/**
 * Init all DB connection
 */
export function initDriver() {
    eslib.init({
        host: process.env.ELASTICSEARCH_HOST
    });
}