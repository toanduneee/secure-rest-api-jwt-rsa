import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
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

const privateKeyDir = path.resolve(__dirname, '..', 'keys');
const privateKeyPath = path.join(privateKeyDir, 'private-key.pem');
fs.mkdirSync(privateKeyDir, { recursive: true });
fs.writeFileSync(privateKeyPath, privateKey, { encoding: 'utf8' });

app.listen(PORT, () => {
    console.log(`[Auth Server] Đang chạy tại http://localhost:${PORT}`);
    console.log(`[JWKS Endpoint] Sẵn sàng tại http://localhost:${PORT}/.well-known/jwks.json`);
    console.log(`[PRIVATE KEY] Đã lưu vào: ${privateKeyPath}`);
});
