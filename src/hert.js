import moment from 'moment';
import util from 'util';
import _ from 'lodash';
import Promise from 'bluebird';
import logger from './utils/logger';
import * as dateUtils from './utils/date';
import * as constants from './utils/constants';
import * as helpers from './helpers';
import * as alertSender from './alertSender'

export default class Hert {
    constructor(config, dbDriver) {
        this.config = config;
        this.dbDriver = dbDriver;
    }

    getTimeFrame (endTime) {
        endTime = endTime || dateUtils.createMoment();

        if (this.config.delay) {
            let timeUnit = helpers.getTimeUnit(this.config.delay);
            endTime.subtract(timeUnit.time, timeUnit.unit);
        }

        let timeFrame = this.config.timeFrame || constants.TIME.defaultTimeFrame;
        let timeUnit = helpers.getTimeUnit(timeFrame);
        let startTime = moment(endTime.format()).subtract(timeUnit.time, timeUnit.unit);

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

        let momentStartTime = dateUtils.dateTimeFormatFromTimestamp(currentTimeFrame.startTime);
        let momentEndTime = dateUtils.dateTimeFormatFromTimestamp(currentTimeFrame.endTime);
        logger.info(`Query: ${this.config.query} from ${momentStartTime} to ${momentEndTime}`);

        if (this.config.distance) {
            if (this.config.deviation) {
                logger.error('Deviation value required');
            }

            let timeUnit = helpers.getTimeUnit(this.config.distance);
            let lastTimeFrame = this.getTimeFrame(dateUtils.createMoment().subtract(timeUnit.time, timeUnit.unit));

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
        let matched = false;

        if ((this.config.min_deviation || this.config.max_deviation) && this.config.type === 'compare') {
            let changedPercentage = 0;
            if (lastHits > 0) {
                changedPercentage = (hits - lastHits) / hits;
            }


            logger.info(`[${this.config.name}] hits: ${hits}, last hits: ${lastHits}, changed percentage: ${changedPercentage}`);
            if (this.config.max_deviation) {
                if (hits > this.config.max_deviation) {
                    logger.info(`Changed value ${changedPercentage} (maximum ${this.config.max_deviation}). sending alert`);
                    matched = true;
                }
            }

            if (this.config.min_deviation) {
                if (hits < this.config.min_deviation) {
                    logger.info(`Changed value ${changedPercentage} (minimum ${this.config.max_deviation}). sending alert`);
                    matched = true;
                }
            }

            return {
                matched: matched,
                value: changedPercentage
            };
        }

        logger.info(`[${this.config.name}] hits: ${hits}`);
        if (_.has(this.config, 'max_hits')) {
            if (hits > this.config.max_hits) {
                logger.info(`Total hits ${hits} (maximum ${this.config.max_hits}). sending alert`);
                matched = true;
            }
        }

        if (_.has(this.config, 'min_hits')) {
            if (hits < this.config.min_hits) {
                logger.info(`Total hits ${hits} (minimum ${this.config.min_hits}). sending alert`);
                matched = true
            }
        }

        return {
            matched: matched,
            value: hits
        };
    }

    processAlert (result) {
        if (!result.matched) {
            return false;
        }

        let alertMessage = util.format('Alert from: %s, Value: %s', this.config.name, result.hits);

        if (this.config.format) {
            if (alertMessage.indexOf('%s') >= 0) {
                alertMessage = util.format(this.config.format, result.hits);
            } else {
                alertMessage = this.config.format;
            }
        }

        this.config.alert.forEach(alert => {
            let alertObject = this.config[alert];

            _.extend(alertObject, {
                message: alertMessage
            });

            alertSender.sendAlert(alert, alertObject);
        });

        return true;
    }
}
