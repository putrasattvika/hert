import winston from 'winston';

let logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/app.log' })
    ]
});

export default logger