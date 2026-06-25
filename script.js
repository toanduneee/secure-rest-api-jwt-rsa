const axios = require('axios');

async function runKeyRotationTest() {
    console.log("===============================================================");
    console.log(" BẮT ĐẦU KỊCH BẢN KIỂM THỬ XOAY VÒNG KHÓA ĐỘNG (ZERO DOWNTIME) ");
    console.log("===============================================================");

    try {
        // Bước 1: Đăng nhập hệ thống để nhận Token ký bằng Khóa thế hệ thứ nhất
        console.log("\n[Bước 1] Khởi tạo phiên đăng nhập cho tài khoản 'test_user'...");
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: "admin",
            password: "admin123"
        });
        const firstAccessToken = loginRes.data.access_token;
        console.log("-> Nhận Token thành công.");

        // Bước 2: Thử truy cập Resource Server bằng Token thứ nhất
        console.log("\n[Bước 2] Gửi yêu cầu truy cập tài nguyên bảo mật bằng Token 1...");
        const res1 = await axios.get('http://localhost:4000/api/secret-data', {
            headers: { 'Authorization': `Bearer ${firstAccessToken}` }
        });
        console.log(`-> Kết quả từ Resource Server: HTTP ${res1.status} - Chữ ký hợp lệ.`);

        // Bước 3: Kích hoạt cuộc gọi Xoay vòng khóa (Key Rotation) khẩn cấp/định kỳ trên Auth Server
        console.log("\n[Bước 3] Thực hiện yêu cầu kích hoạt xoay vòng khóa RSA tập trung...");
        const rotateRes = await axios.post('http://localhost:3000/api/auth/rotate-keys');
        console.log(`-> Phản hồi: ${rotateRes.data.message}`);
        console.log(`   Khóa cũ: [${rotateRes.data.old_kid}] -> Khóa hoạt động mới: [${rotateRes.data.new_active_kid}]`);

        // Bước 4: Kiểm tra tính liên tục - Gửi lại Token thứ nhất (ký bằng khóa cũ) lên Resource Server
        console.log("\n[Bước 4] Kiểm thử tính liên tục: Gửi lại Token 1 (Khóa cũ) lên máy chủ...");
        const res2 = await axios.get('http://localhost:4000/api/secret-data', {
            headers: { 'Authorization': `Bearer ${firstAccessToken}` }
        });
        console.log(`-> Kết quả: HTTP ${res2.status} (Thành công!). Hệ thống không gặp Downtime vì khóa cũ vẫn được giữ lại trong JWKS để đối chiếu.`);

        // Bước 5: Lấy Token mới (ký bằng khóa mới sau khi xoay vòng)
        console.log("\n[Bước 5] Người dùng mới đăng nhập hệ thống sau thời điểm xoay vòng...");
        const loginRes2 = await axios.post('http://localhost:3000/api/auth/login', {
            username: "admin",
            password: "admin123"
        });
        const secondAccessToken = loginRes2.data.access_token;

        // Bước 6: Xác thực Token mới
        console.log("\n[Bước 6] Xác thực mã thông báo mới mang định danh khóa mới...");
        const res3 = await axios.get('http://localhost:4000/api/secret-data', {
            headers: { 'Authorization': `Bearer ${secondAccessToken}` }
        });
        console.log(`-> Kết quả từ Resource Server: HTTP ${res3.status}. Xác thực thành công cặp khóa RSA mới.`);
        
        console.log("\n===============================================================");
        console.log(" KẾT LUẬN: ĐỀ TÀI ĐẠT ĐỦ TIÊU CHÍ AN TOÀN VÀ KHÔNG GÂY GIÁN ĐOẠN ");
        console.log("===============================================================");

    } catch (error) {
        console.error("\n[LỖI THỰC NGHIỆM]: Luồng xử lý thất bại:", error.response?.data || error.message);
    }
}

runKeyRotationTest();