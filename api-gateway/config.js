import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
    APP_NAME: process.env.APP_NAME,
    PORT: process.env.PORT || 3000,
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
}

export default CONFIG;