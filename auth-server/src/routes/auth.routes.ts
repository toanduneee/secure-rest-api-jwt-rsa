import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { generateAndStoreKeyPair, getActiveKeyPair } from '../config/keyManager';

const router = Router();

// 1. Endpoint Đăng nhập (Phục vụ người dùng lấy Token)
router.post('/login', login);

// 2. Endpoint Xoay vòng khóa thực nghiệm (Chỉ Admin/Hệ thống gọi)
router.post('/rotate-keys', (req, res) => {
    const oldActiveKeyPair = getActiveKeyPair();
    const newKeyPair = generateAndStoreKeyPair();

    res.json({
        message: "Xoay vòng khóa RSA thành công!",
        old_kid: oldActiveKeyPair.kid,
        new_active_kid: newKeyPair.kid,
        total_keys_in_jwks: oldActiveKeyPair.kid !== newKeyPair.kid ? 2 : 1
    });
});

export default router;