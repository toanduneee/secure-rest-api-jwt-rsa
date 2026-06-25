# Secure RESTful API Authentication using JWT and RSA

Dự án mô phỏng và triển khai hệ thống xác thực phi trạng thái (Stateless Authentication) cho kiến trúc RESTful API. Hệ thống sử dụng chứng thư số JWT (JSON Web Token) kết hợp với thuật toán chữ ký số bất đối xứng RSA-2048 và cơ chế quản lý khóa tập trung JWKS (JSON Web Key Set).

Dự án này được xây dựng nhằm mục đích nghiên cứu An toàn thông tin, đặc biệt giải quyết các lỗ hổng phổ biến của cấu hình JWT dùng khóa đối xứng (HMAC) như: Offline Cracking và Algorithm Confusion.

## Kiến trúc hệ thống

Hệ thống được chia làm 2 vi dịch vụ (Microservices) độc lập, tuân thủ nguyên tắc đặc quyền tối thiểu (Least Privilege):

1. Auth Server (Identity Provider - Port 3000): Quản lý định danh, sinh cặp khóa RSA, lưu trữ Private Key (bảo mật tuyệt đối), ký phát hành JWT và công bố Public Key qua Endpoint JWKS.

2. Resource Server (Port 4000): Chứa dữ liệu nghiệp vụ. Hoàn toàn không giữ Private Key. Tự động nạp Public Key từ JWKS, lưu Cache và xác thực chữ ký JWT.

## Yêu cầu hệ thống (Prerequisites)

Để chạy dự án, máy tính của bạn cần cài đặt sẵn:

* Docker và Docker Compose.

* Môi trường Node.js (nếu muốn chạy các script kiểm thử nâng cao trên máy host).

* Cổng `3000`, `4000` và `3306` trên máy đang không bị ứng dụng khác chiếm dụng.

## Hướng dẫn cài đặt và chạy hệ thống

Chỉ với một lệnh duy nhất, Docker sẽ tự động build image, thiết lập mạng nội bộ và khởi chạy toàn bộ database cùng các servers.

Bước 1: Clone repository về máy:
```
git clone [https://github.com/toanduneee/secure-rest-api-jwt-rsa.git](https://github.com/toanduneee/secure-rest-api-jwt-rsa.git)
cd secure-rest-api-jwt-rsa
```

Bước 2: Khởi chạy hệ thống bằng Docker Compose:
```
docker-compose up -d --build
```

Bước 3: Kiểm tra trạng thái container:
```
docker-compose ps
```

Nếu trạng thái của `cdcs-auth-server`, `cdcs-resource-server` và `cdcs-mysql` đều là `Up`, hệ thống đã sẵn sàng hoạt động.

## Hướng dẫn kiểm thử cơ bản (Testing)

1. Lấy thông tin Public Key (JWKS)
```
curl -X GET http://localhost:3000/.well-known/jwks.json
```

2. Đăng nhập và lấy Access Token
Hệ thống đã khởi tạo sẵn tài khoản `test` / `123456` trong database (`init.sql`).
```
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"username": "test", "password": "123456"}'
```

Lưu lại chuỗi `access_token` nhận được để dùng cho bước sau.

3. Truy cập tài nguyên bảo mật tại Resource Server
Thay <YOUR_ACCESS_TOKEN> bằng chuỗi token lấy được ở bước 2.
```
curl -X GET http://localhost:4000/api/secret-data \
-H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

## Hướng dẫn kiểm thử nâng cao (Advanced Testing)

Dự án cung cấp sẵn các kịch bản kiểm thử bằng Node.js ở thư mục gốc để đánh giá các tính năng bảo mật và hiệu năng.
Trước khi chạy, hãy đảm bảo bạn đã cài đặt các thư viện cần thiết tại thư mục gốc:
```
npm install
```

1. Kiểm thử xoay vòng khóa tự động (Zero Downtime Key Rotation)
Kịch bản mô phỏng quá trình hệ thống cập nhật khóa RSA mới mà không làm mất phiên đăng nhập của người dùng đang giữ Token cũ.
```
node w-script.js
```

Script sẽ tự động đăng nhập, lấy Token, gửi lệnh yêu cầu Auth Server đổi khóa, và chứng minh Token cũ vẫn được Resource Server chấp nhận nhờ cơ chế lưu vết trong JWKS.

2. Kiểm thử khả năng chịu tải (Stress Test)
Kịch bản ép tải hệ thống dưới áp lực cao (mặc định 100 kết nối đồng thời trong 10 giây bằng Autocannon) để đánh giá thông lượng (throughput) và độ trễ (latency).
```
node stress-test.js
```

Script này giúp minh chứng sự tối ưu hiệu năng tuyệt vời khi Resource Server áp dụng bộ nhớ đệm (Cache) thay vì phải liên tục gọi mạng về Auth Server để lấy JWKS.

## Điểm nhấn Bảo mật (Security Highlights)

* Asymmetric Signature (RS256): Khắc phục nhược điểm dùng chung Secret Key của HS256, vô hiệu hóa hoàn toàn nỗ lực tấn công bẻ khóa ngoại tuyến (Offline Cracking).

* Explicit Algorithm Constraint: Hardcode thuật toán RS256 trong hàm verify tại Resource Server, chống lại lỗ hổng hạ cấp thuật toán (Algorithm Confusion CVE-2015-9235).

* JWKS Key Rotation: Hỗ trợ cơ chế xoay vòng khóa động, giới hạn vòng đời của Public Key, cô lập vùng thiệt hại nếu lộ lọt khóa riêng tư.

## Cấu trúc thư mục chi tiết
```
.
├── auth-server/             # Vi dịch vụ Identity Provider (Port 3000)
│   ├── keys/                # Thư mục lưu trữ Private Key dạng PEM (Bảo mật tuyệt đối)
│   ├── src/                 # Mã nguồn TypeScript của Auth Server
│   │   ├── config/          # Cấu hình kết nối Database (db.ts) và Quản lý khóa (keyManager.ts)
│   │   ├── controllers/     # Xử lý logic đăng nhập (auth) và trả về khóa công khai (jwks)
│   │   ├── routes/          # Định tuyến các API endpoints (/login, /.well-known/jwks.json)
│   │   └── server.ts        # Điểm neo khởi chạy tiến trình Express
│   ├── Dockerfile           # Đóng gói image cho Auth Server
│   └── package.json
├── resource-server/         # Vi dịch vụ API Server (Port 4000)
│   ├── src/                 # Mã nguồn TypeScript của Resource Server
│   │   ├── config/          # Cấu hình thư viện JWKS Client (Tự động nạp và lưu cache khóa)
│   │   ├── controllers/     # Trả về tài nguyên/dữ liệu nghiệp vụ bảo mật
│   │   ├── middlewares/     # Chứa logic xác thực JWT nghiêm ngặt, chống Algorithm Confusion
│   │   ├── routes/          # Định tuyến API (/api/secret-data)
│   │   └── server.ts        # Điểm neo khởi chạy tiến trình Express
│   ├── Dockerfile           # Đóng gói image cho Resource Server
│   └── package.json
├── init.sql                 # Kịch bản tự động khởi tạo bảng MySQL và chèn tài khoản mẫu
├── docker-compose.yml       # Tệp cấu hình điều phối các container (Auth, Resource, Database)
├── script.js                # Kịch bản kiểm thử tính năng Xoay vòng khóa (Zero Downtime)
├── stress-test.js           # Kịch bản ép tải hệ thống bằng Autocannon (Đánh giá Cache JWKS)
└── README.md
```