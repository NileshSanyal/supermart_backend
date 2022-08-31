import mongoose from 'mongoose';
import debug from 'debug';

const log: debug.IDebugger = debug('app:mongoose-service');
import { APP_CONST } from '../constants/constants';

const MONGO_LOCALDB_CONNECTION_URL = APP_CONST.MONGODB_CONFIG.LOCAL_DB_CONNECTION_URL;
const MONGO_CONNECTION_RETRY_IN_SECONDS = APP_CONST.MONGODB_CONFIG.SERVER_CONNECTION_RETRY_IN_SECONDS;
const MONGO_TIMEOUT_IN_MILLISECONDS = APP_CONST.MONGODB_CONFIG.SERVER_SELECTION_TIMEOUT_IN_MILLISECONDS;

class MongooseService {
    private count = 0;
    private mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: MONGO_TIMEOUT_IN_MILLISECONDS,
        useFindAndModify: false
    };

    constructor() {
        this.connectWithRetry();
    }

    getMongoose() {
        return mongoose;
    }

    /**
     * @description This method will try to reconnect with mongodb after 5 second every time it fails to connect
     */
    connectWithRetry = () => {
        log('Attempting mongodb connection. Will retry if required');
        mongoose.connect(MONGO_LOCALDB_CONNECTION_URL, this.mongooseOptions)
            .then(() => {
                log('Mongodb is connected');
            })
            .catch((error) => {
                log(`Actual mongodb error details: ${error}`);
                log(`Mongodb connection unsuccessful. Will retry #${++this.count} in after ${MONGO_CONNECTION_RETRY_IN_SECONDS} seconds`);
                setTimeout(this.connectWithRetry, MONGO_CONNECTION_RETRY_IN_SECONDS * 1000);
            });
    };
}

export default new MongooseService();
