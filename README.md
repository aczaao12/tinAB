# Ứng Dụng Ôn Tập Trắc Nghiệm Tin Học (tinAB)

Web ôn tập trắc nghiệm siêu nhẹ (Super MVP), xây dựng bằng **React 19 + TypeScript + Vite**, thuần Client-side (không cần backend, không cần database), lưu lịch sử bài làm trên **LocalStorage** và tương thích hoàn hảo để host trực tiếp trên **GitHub Pages**.

---

## 🚀 Tính năng chính

1. **Dữ liệu đầy đủ từ PDF**:
   - Mặc định mở **TEST 1** (60 câu hỏi).
   - Hỗ trợ cả **TEST 1 đến TEST 6** và chế độ **Tổng hợp tất cả 338 câu hỏi**.
   - Phân loại rõ ràng câu hỏi chọn 1 đáp án và câu hỏi chọn nhiều đáp án.

2. **Hai chế độ linh hoạt**:
   - 🎯 **Chế độ Ôn tập**: Nhấp chọn đáp án sẽ biết ngay lập tức đúng/sai, hiển thị đáp án chuẩn xác cùng giải thích để học thuộc kiến thức nhanh.
   - ⏱️ **Chế độ Thi thử**: Đồng hồ bấm giờ thực tế, làm bài và nhấn **Nộp bài** để tính điểm (thang điểm 10 và phần trăm), xếp loại và xem chi tiết câu đúng/sai.

3. **Lưu lịch sử & Tên người dùng (LocalStorage)**:
   - Hỏi tên khi vào web lần đầu và cho phép đổi tên bất kỳ lúc nào.
   - Lưu lại lịch sử các lần thi: ngày giờ, tên người làm, đề thi, số điểm, thời gian làm bài.
   - Thống kê tổng số lần làm, điểm trung bình, điểm cao nhất.

4. **Luyện tập thông minh**:
   - ⚡ **Làm lại câu sai**: Sau khi nộp bài thi, có thể bấm nút chỉ làm lại các câu bị sai để củng cố kiến thức.
   - ⭐ **Đánh dấu câu hỏi**: Đánh dấu các câu khó để xem lại trong bảng điều hướng.
   - 🔀 **Xáo trộn câu hỏi**: Đổi ngẫu nhiên thứ tự các câu hỏi.
   - ⌨️ **Hỗ trợ phím tắt**: Phím mũi tên Trái/Phải để chuyển câu, phím `1`, `2`, `3`, `4`, `5` để chọn nhanh đáp án.
   - 🌓 **Giao diện Sáng / Tối**: Tự động nhận diện theme hệ thống và có nút chuyển đổi trực tiếp.

---

## 💻 Hướng dẫn chạy thử tại máy (Local)

```bash
# 1. Cài đặt dependencies (pnpm hoặc npm)
pnpm install

# 2. Chạy môi trường phát triển
pnpm dev
# Truy cập http://localhost:5173
```

---

## 📦 Hướng dẫn Deploy lên GitHub Pages

Cấu hình đường dẫn trong `vite.config.ts` đã được thiết lập `base: './'`, nên web có thể chạy trên bất kỳ thư mục con nào của GitHub Pages mà không bị lỗi đường dẫn file.

### Cách 1: Tự động qua GitHub Actions (Được khuyến nghị - Đã cấu hình sẵn)

Workflow `.github/workflows/deploy.yml` đã được tạo sẵn trong project. Bạn chỉ cần:
1. Tạo một repository mới trên GitHub (ví dụ: `tinAB`).
2. Push toàn bộ source code lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for tinAB quiz app"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/tinAB.git
   git push -u origin main
   ```
3. Trên GitHub repo: Vào **Settings** -> **Pages** -> Tại mục **Build and deployment / Source**, chọn **GitHub Actions**.
4. GitHub sẽ tự động build và cấp link web dạng: `https://<tai-khoan-cua-ban>.github.io/tinAB/`.

### Cách 2: Deploy thủ công thư mục `dist`

```bash
# Build mã nguồn thành file tĩnh
pnpm run build

# Thư mục dist/ đã chứa toàn bộ index.html, JS, CSS độc lập sẵn sàng upload
```

---

## 🛠️ Cấu trúc thư mục

```
tinAB/
├── .github/workflows/deploy.yml   # Workflow tự động deploy GitHub Pages
├── scripts/
│   └── parse_tests.py            # Script tự động trích xuất câu hỏi từ PDF sang JSON/TS
├── src/
│   ├── assets/                   # Tài nguyên hình ảnh / logo
│   ├── components/
│   │   ├── ExamResultModal.svelte # Modal tổng kết điểm và xếp loại
│   │   ├── HistoryModal.svelte    # Modal xem lịch sử và thống kê LocalStorage
│   │   ├── NameModal.svelte       # Modal hỏi & đổi tên người dùng
│   │   ├── Navbar.svelte          # Thanh menu trên cùng (chọn đề, chế độ, hẹn giờ)
│   │   ├── QuestionCard.svelte    # Khung hiển thị câu hỏi và đáp án
│   │   └── QuestionGrid.svelte    # Bảng số câu hỏi điều hướng nhanh
│   ├── data/
│   │   ├── testsData.ts           # Dữ liệu 338 câu hỏi trích xuất từ TEST 1 - TEST 6
│   │   ├── testsData.json
│   │   └── types.ts               # Định nghĩa TypeScript
│   ├── utils/
│   │   └── storage.ts             # Quản lý LocalStorage (tên, lịch sử làm bài)
│   ├── App.svelte                 # Component chính kết nối toàn bộ logic
│   ├── app.css                    # Toàn bộ CSS phong cách hiện đại, hỗ trợ Dark Mode
│   └── main.ts
├── vite.config.ts                 # Cấu hình base: './' cho GitHub Pages
└── package.json
```
