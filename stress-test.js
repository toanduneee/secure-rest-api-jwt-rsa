const autocannon = require('autocannon');
const axios = require('axios');
const https = require('https');

// Bỏ qua lỗi chứng chỉ SSL trong môi trường Localhost
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function runStressTest() {
    console.log("==========================================================");
    console.log(" BẮT ĐẦU KIỂM THỬ SỨC CHỊU TẢI (STRESS TEST) BẰNG AUTOCANNON");
    console.log("==========================================================");

    try {
        // 1. Xin cấp Access Token hợp lệ từ Auth Server
        console.log("\n[1/2] Đang lấy Access Token hợp lệ từ Auth Server...");
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            username: "toan_at20", // Tài khoản trong DB của bạn
            password: "password123"
        }, { httpsAgent });
        const token = loginRes.data.access_token;
        console.log("-> Nhận Token thành công!");

        // 2. Cấu hình và chạy Autocannon ép tải Resource Server
        console.log("\n[2/2] Bắt đầu ép tải: 100 kết nối đồng thời trong 10 giây...");
        console.log("Vui lòng không tắt Terminal...\n");

        const instance = autocannon({
            url: 'http://localhost:4000/api/secret-data', // Endpoint bảo mật
            connections: 100, // 100 User gửi request cùng lúc
            pipelining: 1,
            duration: 10,     // Bắn liên tục trong 10 giây
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Hiển thị thanh tiến trình
        autocannon.track(instance, { renderProgressBar: true });

        // 3. In kết quả sau 10 giây
        instance.on('done', (result) => {
            console.log("\n================ KẾT QUẢ STRESS TEST ====================");
            console.log(`- Tổng số Request đã xử lý : ${result.requests.total} lượt`);
            console.log(`- Thông lượng (Throughput) : ${result.requests.average} req/giây`);
            console.log(`- Độ trễ trung bình        : ${result.latency.average} ms`);
            console.log(`- Số lượng lỗi (Errors)    : ${result.errors}`);
            console.log(`- Timeout                  : ${result.timeouts}`);
            console.log("==========================================================");
        });

    } catch (err) {
        console.error("Lỗi khởi tạo test:", err.message);
    }
}

runStressTest();