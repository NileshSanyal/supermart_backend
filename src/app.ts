import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import * as http from 'http';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import helmet from 'helmet';
import cors from 'cors';
import debug from 'debug';
import slowDown from 'express-slow-down';

import { CommonRoutes } from './common/common.routes';
import { UsersRoutes } from './modules/users/users.route';
import { CategoryRoutes } from './modules/category/category.route';
import { SubCategoryRoutes } from './modules/sub-category/sub-category.route';
import { ProductRoutes } from './modules/product/product.route';
import { OrderRoutes } from './modules/order/order.route';

import { AuthRoutes } from './auth/auth.routes';
import { APP_CONST } from '../src/common/constants/constants';
import { NotFoundError } from './common/errors/not-found-error';
import { errorHandler } from './common/errors/middlewares/error-handler';

const dotenvConfig = dotenv.config();
if (dotenvConfig.error) {
    throw dotenvConfig.error;
}
const app: Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;
const routes: Array<CommonRoutes> = [];
const debugLog: debug.IDebugger = debug('app');

/**
 * @description This middleware takes care of slowing down
 * responses rather than blocking them.
 */
const speedLimiter = slowDown({
    windowMs: APP_CONST.API_SLOW_DOWN_CONFIG.SIMULTANEOUS_REQUEST_COUNT,
    delayAfter: APP_CONST.API_SLOW_DOWN_CONFIG.DELAY_AFTER,
    delayMs: APP_CONST.API_SLOW_DOWN_CONFIG.DELAY_IN_MILLISECONDS
});

app.enable('trust proxy');
app.use('/api', speedLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

/**
 * @description Here we are preparing expressWinston logging middleware configuration,
 * which will automatically log all HTTP requests handled by express js
 */
const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true })
    )
};

if (!process.env.DEBUG) {
    loggerOptions.meta = false;
}

app.use(expressWinston.logger(loggerOptions));
routes.push(new AuthRoutes(app));
routes.push(new UsersRoutes(app));
routes.push(new CategoryRoutes(app));
routes.push(new SubCategoryRoutes(app));
routes.push(new ProductRoutes(app));
routes.push(new OrderRoutes(app));

app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

const runningMessage = `Server running at http://localhost:${port}`;
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: runningMessage });
});

export default server.listen(port, () => {
    routes.forEach((route: CommonRoutes) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
    console.log(runningMessage);
});
