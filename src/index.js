import schedule from 'node-schedule';
import yaml from 'yamljs';
import Hert from './hert';
import helpers from './helpers';
import constants from './utils/constants';
import * as dbDriver from './dbDriver';
import * as alertSender from './alertSender';
import dotenv from 'dotenv';

dotenv.config();
var configs = yaml.load('./config.yml');
var jobs = {};

dbDriver.initDriver();
alertSender.initAlert();

configs.forEach(config => {
    let app = new Hert(
        config,
        dbDriver.getDbDriver(config)
    );

    var job  = function () {
        return app.executeQuery()
            .then(app.processResponse.bind(app))
            .then(app.processAlert.bind(app));
    };

    if (config.runFirst) {
        // Running the task when start program and running it again depends on cron configuration
        job().then(() => {
            jobs[config.name] = schedule.scheduleJob(config.cron, job);
        });
    } else {
        // Running task depends on cron configuration
        jobs[config.name] = schedule.scheduleJob(config.cron, job);
    }
});