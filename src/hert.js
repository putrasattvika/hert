import moment from 'moment';
import util from 'util';
import _ from 'lodash';
import Promise from 'bluebird';
import logger from './utils/logger';
import * as constants from './utils/constants';
import * as helpers from './helpers';
import * as alertSender from './alertSender'

export default class Hert {
    constructor(config, dbDriver) {
        this.config = config;
        this.dbDriver = dbDriver;
    }

    getTimeFrame (endTime) {
        endTime = endTime || moment();

        if (this.config.delay) {
            let timeUnit = helpers.getTimeUnit(this.config.delay);
            endTime.subtract(timeUnit.time, timeUnit.unit);
        }

        let timeFrame = this.config.timeFrame || constants.TIME.defaultTimeFrame;
        let timeUnit = helpers.getTimeUnit(timeFrame);
        let startTime = moment(endTime.format()).subtract(timeUnit.time, timeUnit.unit);

        logger.info(`Query from ${startTime.format()} to ${endTime.format()}`);
        return {
            startTime: startTime.valueOf(),
            endTime: endTime.valueOf()
        }
    }

    executeQuery () {
        let currentTimeFrame = this.getTimeFrame();
        let currentQuery = this.dbDriver.query(this.config.query, currentTimeFrame.startTime, currentTimeFrame.endTime);

        var query = {
            hits: currentQuery
        };

        if (this.config.distance) {
            if (this.config.deviation) {
                logger.error('Deviation value required');
            }

            let timeUnit = helpers.getTimeUnit(this.config.distance);
            let lastTimeFrame = this.getTimeFrame(moment().subtract(timeUnit.time, timeUnit.unit));

            let lastQuery = this.dbDriver.query(this.config.query, lastTimeFrame.startTime, lastTimeFrame.endTime);

            _.extend(query, {
                last: lastQuery
            });
            return Promise.props(query)
        }

        return Promise.props(query)
    }

    processResponse (result) {
        let hits = result.hits;
        let lastHits = result.last;

        if ((this.config.min_deviation || this.config.max_deviation) && this.config.type === 'compare') {
            let changedPercentage = 0;
            if (lastHits > 0) {
                changedPercentage = (hits - lastHits) / hits;
            }

            logger.info(`Changed value ${changedPercentage}`);
            if (this.config.max_deviation) {
                if (hits >= this.config.max_deviation) {
                    logger.info(`Changed value ${changedPercentage} (maximum ${this.config.max_deviation}). sending alert`);
                }
            }

            if (this.config.min_deviation) {
                if (hits <= this.config.min_deviation) {
                    logger.info(`Changed value ${changedPercentage} (minimum ${this.config.max_deviation}). sending alert`);
                }
            }

            return changedPercentage;
        }

        if (this.config.max_hits) {
            if (hits >= this.config.max_hits) {
                logger.info(`Total hits ${hits} (maximum ${this.config.max_hits}). sending alert`);
            }
        }

        if (this.config.min_hits) {
            if (hits <= this.config.min_hits) {
                logger.info(`Total hits ${hits} (minimum ${this.config.min_hits}). sending alert`);
            }
        }

        return hits;
    }

    processAlert (result) {
        var alertMessage = util.format('Alert from: %s, Value: %s', this.config.name, result);

        if (this.config.format) {
            alertMessage = util.format(this.config.format, result);
        }

        this.config.alert.forEach(alert => {
            let alertObject = this.config[alert];

            _.extend(alertObject, {
                message: alertMessage
            });

            alertSender.sendAlert(alert, alertObject);
        })
    }
}