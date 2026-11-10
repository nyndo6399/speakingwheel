# SpeakSpin - Vòng Xoay Tiếng Anh Lớp Học (Classroom Speaking Wheel Game)

Ứng dụng vòng xoay may mắn tương tác dành cho giáo viên và học sinh luyện nói tiếng Anh:
- Hỗ trợ chế độ 1 vòng xoay đơn (Single Wheel) và 2 vòng xoay song song (Dual Wheels).
- Hỗ trợ thay ảnh trực tiếp vào từng ô vòng xoay (Slot Image Customizer).
- Hỗ trợ 2 chế độ quay: **Quay Ngẫu Nhiên** và **Quay Theo Cặp Hợp Lý (Matched Pairs)** (ví dụ: cooking ➔ in the kitchen; eating ➔ in the dining room).
- Tùy chỉnh câu hỏi và mẫu trả lời (hỗ trợ xuống dòng `Enter` to và căn giữa đẹp mắt).
- Quản lý, lưu trữ, xuất và nhập nhiều lớp học (IndexedDB & LocalStorage).
- Chế độ toàn màn hình (Full Screen) tối ưu cho TV, Smartboard, máy chiếu lớp học.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN MÁY TÍNH

### Cách 1: Chạy trực tiếp file Offline (Không cần cài đặt gì)
Trong thư mục `public/` hoặc file `speakspin-game-offline.html`:
- Bạn chỉ cần nhấp đúp chuột mở file `speakspin-game-offline.html` bằng bất kỳ trình duyệt nào (Google Chrome, Microsoft Edge, Safari, Cốc Cốc, Firefox).
- Trò chơi chạy ngay lập tức, không cần mạng internet và không cần cài Node.js.

---

### Cách 2: Chạy mã nguồn bằng Node.js & Vite (Dành cho lập trình viên / chỉnh sửa code)

#### 1. Yêu cầu hệ thống:
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).

#### 2. Cài đặt các thư viện:
Mở Terminal hoặc Command Prompt tại thư mục dự án và gõ lệnh:
```bash
npm install
```

#### 3. Chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```
Sau đó mở trình duyệt và truy cập: `http://localhost:3000` (hoặc cổng mà Terminal hiển thị).

#### 4. Đóng gói bản chạy sản xuất (Production Build):
```bash
npm run build
```
Kết quả bản chạy sẵn sàng đưa lên hosting sẽ nằm trong thư mục `dist/`.

---

## 📁 CẤU TRÚC MÃ NGUỒN

```
speakspin/
├── src/
│   ├── components/         # Các thành phần giao diện (Canvas, Modals, TopBar, Editor...)
│   │   ├── SpinWheelCanvas.tsx    # Vòng xoay Canvas HTML5 mượt mà, physics ticks
│   │   ├── WinnerModal.tsx        # Bảng chúc mừng kết quả to rõ, câu hỏi lớp học
│   │   ├── PairMatchingModal.tsx  # Cài đặt ghép cặp hợp lý cho 2 vòng
│   │   ├── SlotImageModal.tsx     # Thay ảnh vào từng ô
│   │   ├── WheelEditorPanel.tsx   # Quản lý số ô, chữ, màu sắc
│   │   ├── QuestionBox.tsx        # Ô câu hỏi đa dòng
│   │   ├── RoomsModal.tsx         # Quản lý các lớp học
│   │   └── TopBar.tsx             # Thanh công cụ trên cùng
│   ├── types/game.ts       # Định nghĩa kiểu dữ liệu TypeScript
│   ├── utils/
│   │   ├── wheelMath.ts    # Thuật toán quay số học, góc quay, trúng thưởng
│   │   ├── soundEngine.ts  # Hiệu ứng âm thanh Web Audio API
│   │   ├── storage.ts      # Lưu trữ IndexedDB / LocalStorage & JSON export
│   │   ├── pairMatching.ts # Thuật toán gợi ý & kiểm tra cặp ghép thông minh
│   │   └── defaultRooms.ts # Dữ liệu bài mẫu (Action + Places, Animals,...)
│   ├── App.tsx             # Luồng điều khiển chính của game
│   └── main.tsx            # Điểm khởi chạy React
├── public/                 # File tĩnh, hình ảnh & bản tải về
├── index.html              # Trang HTML chính
├── package.json            # Danh sách thư viện & scripts
└── vite.config.ts          # Cấu hình Vite & Tailwind CSS
```

Chúc bạn có những giờ học tiếng Anh thật vui và hào hứng! 🎉
