import crypto from 'crypto';

interface KeyPairEntry {
    kid: string;
    privateKey: string;
    publicKey: string;
    jwk: any;
    createdAt: Date;
}

// Kho lưu trữ các cặp khóa trong bộ nhớ máy chủ Auth
let keyStore: KeyPairEntry[] = [];

// Hàm sinh một cặp khóa RSA 2048-bit mới và đóng gói thành JWK
export function generateAndStoreKeyPair(): KeyPairEntry {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    const timestamp = new Date();
    const kid = `rsa-${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${timestamp.getTime()}`;

    const publicJwk = crypto.createPublicKey(publicKey).export({ format: 'jwk' });
    const jwkEntry = {
        ...publicJwk,
        kid: kid,
        use: 'sig',
        alg: 'RS256'
    };

    const newKeyEntry: KeyPairEntry = {
        kid,
        privateKey,
        publicKey,
        jwk: jwkEntry,
        createdAt: timestamp
    };

    // Đưa khóa mới lên đầu mảng để ưu tiên sử dụng
    keyStore.unshift(newKeyEntry);
    
    // Giới hạn kho lưu trữ tối đa 3 cặp khóa gần nhất để tránh tràn bộ nhớ
    if (keyStore.length > 3) {
        keyStore.pop();
    }

    return newKeyEntry;
}

// Khởi tạo khóa ban đầu khi máy chủ chạy
if (keyStore.length === 0) {
    generateAndStoreKeyPair();
}

// Lấy khóa mới nhất (khóa Active) để ký Token JWT
export function getActiveKeyPair() {
    return keyStore[0];
}

// Lấy danh sách toàn bộ Public Key dưới dạng JWKS công khai
export function getAllPublicJwks() {
    return keyStore.map(entry => entry.jwk);
}