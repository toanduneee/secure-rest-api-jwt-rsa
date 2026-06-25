import { Request, Response } from 'express';
import { getAllPublicJwks } from '../config/keyManager';

export const getJwks = (req: Request, res: Response) => {
    // Thiết lập Cache-Control tối đa 5 phút để các Resource Server tối ưu hiệu năng
    res.set('Cache-Control', 'public, max-age=300');

    console.log(`[CẢNH BÁO TẢI] Nhận yêu cầu GET /.well-known/jwks.json từ Resource Server...`);
    
    const keys = getAllPublicJwks();
    res.json({ keys });
};