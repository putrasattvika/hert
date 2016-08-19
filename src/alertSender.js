import * as slack from './lib/slack'
import * as constants from './utils/constants'

/**
 * Init alerting
 */
export  function initAlert() {
    slack.init();
}

/**
 * Send alert depends on type
 *
 * @param type
 * @param data
 */
export function sendAlert(type, data) {
    // You can add alert handler here
    if (type === constants.ALERT.slack) {
        slack.sendAlert(data)
    }
    
}