# Sử dụng Node.js 20
FROM node:20

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json để cài đặt dependency trước
COPY package*.json ./

# Cài đặt các package
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Build source code (nếu có)
RUN npm run build

# Mở cổng cần thiết (thay bằng cổng bạn dùng trong NestJS)
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "run", "start"]