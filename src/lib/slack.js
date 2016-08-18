import Slack from 'slack-node';
import Promise from 'bluebird';
import logger from '../utils/logger';

var slack;

export function init() {
    slack = new Slack();
    slack.setWebhook(process.env.SLACK_WEBHOOK_URL);
}

export function sendAlert(data) {
    var slackWebhook = Promise.promisify(slack.webhook);

    slackWebhook({
        channel: data.channel,
        username: data.username || "Hert",
        icon_emoji: data.icon_emoji || ":ghost:",
        text: data.message
    }).then(response => {
        logger.info(response);

        return true;
    }).catch(error => {
        logger.error(error)
    })
}