import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import jwksRoutes from './routes/jwks.routes';
import { privateKey } from './config/keys';

const app = express();
app.use(cors());
app.use(express.json());

// Gắn các Routes vào App
app.use('/api/auth', authRoutes);
app.use('/.well-known', jwksRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[Auth Server] Đang chạy tại http://localhost:${PORT}`);
    console.log(`[JWKS Endpoint] Sẵn sàng tại http://localhost:${PORT}/.well-known/jwks.json`);
    console.log("=== PRIVATE KEY CỦA HỆ THỐNG ===");
    console.log(privateKey);
    console.log("=================================");
});
