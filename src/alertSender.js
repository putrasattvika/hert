import * as slack from './lib/slack'
import * as constants from './utils/constants'

export  function initAlert() {
    slack.init();
}

export function sendAlert(type, data) {
    // You can add alert handler here
    if (type === constants.ALERT.slack) {
        slack.sendAlert(data)
    }
}