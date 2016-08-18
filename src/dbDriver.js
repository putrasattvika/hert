import * as eslib from './lib/elasticsearch';
import * as constants from './utils/constants';

export function getDbDriver(config) {
    if (config.source === constants.SOURCE_TYPE.elasticsearch) {
        return eslib;
    }
}

export function initDriver() {
    eslib.init({
        host: process.env.ELASTICSEARCH_HOST
    });
}