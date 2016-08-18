'use strict';

import elasticsearch from 'elasticsearch';
import logger from './../utils/logger';

let client;

function init(config) {
    client = new elasticsearch.Client({
        host: config.host
    });
}

function query(query, startTime, endTime) {
    return client.search({
        index: 'filebeat-*',
        type: 'log',
        body: {
            query: {
                filtered: {
                    query: {
                        query_string: {
                            query: query,
                            analyze_wildcard: true
                        }
                    },
                    filter: {
                        bool: {
                            must: [
                                {
                                    range: {
                                        "@timestamp": {
                                            gte: startTime,
                                            lte: endTime,
                                            format: "epoch_millis"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }).then(function (response) {
        return response.hits.total;
    }, function (err) {
        logger.error(err.message);
    });
}

export {init, query}