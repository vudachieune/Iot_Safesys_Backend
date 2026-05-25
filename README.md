# Motorbike Crash Detection Backend Server

## Yêu cầu môi trường

Node.js: phiên bản >= 14

https://nodejs.org/en/download/package-manager/current

## Cài đặt dependencies

1. Cài yarn (nếu chưa có)

```bash
npm install -g yarn
```

2. Cài dependencies

```bash
yarn install
```

## Biến môi trường

Chạy lệnh sau bằng terminal

```bash
cp .env.example .env
```

hoặc tạo file bằng giao diện, rồi copy nội dung từ file `.env.example` vào.

Chỉnh sửa các giá trị cho phù hợp như `MQTT Broker`, `Twilio`, `JWT secret key`

> Các cấu hình như MQTT Broker có thể sử dụng MQTT Broker free, có thể tìm kiếm trên Google: HiveMQ, Emqx broker,...

> Twilio thì tạo tài khoản trên trang chủ, cấu hình project,....

> JWT là chuỗi mã hóa token người dùng

Ngoài ra cần thêm file cấu hình Firebase

1. Tạo project trên firebase
2. Tạo ứng dụng Web trên firebase
3. Lấy nội dung/file google service account từ mục ứng dụng web
4. Tạo/Copy nội dung vào file `google-application-credentials.json`, để file ở thư mục gốc source code.

## Khởi chạy dự án

- Chạy trực tiếp bằng Node.Js

```bash
yarn dev # Chạy ở chế độ dev (watch module)
# hoặc
yarn start # Chạy ở chế độ tiêu chuẩn
```

- Hoặc chạy qua Docker (yêu cầu đã cài sẵn Docker)

```bash
docker build -t app .
docker run --rm -it -p 8888:8888 app
```
