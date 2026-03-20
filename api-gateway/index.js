import express from 'express';
import CONFIG from './config.js';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import FormData from 'form-data';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

const app = express();
    
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: {
        error: 'Demasiadas peticiones. Por favor, espera un minuto.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
app.use(cookieParser());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API Gateway' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'API Gateway is healthy' });
});

app.get('/health/ai-service', async (req, res) => {
    try {
        const response = await axios.get(`${CONFIG.AI_SERVICE_URL}/health`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ status: 'AI Service is not healthy' });
    }
});

app.post('/predict', upload.single('file'), async (req, res) => {
    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, req.file.originalname);

        const response = await axios.post(`${CONFIG.AI_SERVICE_URL}/predict`, formData, {
            headers: formData.getHeaders(),
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error", error.message);
        res.status(502).json({ error: 'Error communicating with AI service' });
    }
});

app.listen(CONFIG.PORT, () => {
    console.log(`Server running on http://localhost:${CONFIG.PORT}`);
});
