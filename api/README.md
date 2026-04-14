# CV Parsing API (Python + Ollama Llama3)

API này cho phép người dùng upload file CV (PDF) và trích xuất thông tin có cấu trúc (JSON) bằng cách kết hợp RegEx (cho thông tin cơ bản) và Ollama Llama3 (cho thông tin phức tạp).

## Yêu cầu hệ thống
1. **Python 3.10+**
2. **Ollama**: Tải và cài đặt tại [ollama.com](https://ollama.com/).
3. **Model Llama3**: Chạy lệnh `ollama run llama3` để đảm bảo model đã được tải về máy.

## Hướng dẫn cài đặt

1. **Tạo môi trường ảo và cài đặt thư viện:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Chạy API:**
   ```powershell
   uvicorn main:app --reload
   ```
   API sẽ chạy tại: `http://localhost:8000`

## Cách sử dụng

### 1. Trích xuất CV (API Endpoint)
Dùng Postman hoặc CURL để gửi request:
- **Method**: `POST`
- **URL**: `http://localhost:8000/extract-cv`
- **Body**: `form-data`
  - `file`: (Chọn file PDF CV của bạn)

### 2. Chạy test nhanh (Script)
Bạn có thể chạy script `test_local.py` để kiểm tra việc đọc PDF và gọi Ollama:
```powershell
.\venv\Scripts\python test_local.py
```

## Cấu trúc thư mục
- `main.py`: Khởi tạo API FastAPI.
- `parser.py`: Logic trích xuất văn bản và gọi LLM.
- `models.py`: Định nghĩa cấu trúc dữ liệu CV (Pydantic).
- `test_local.py`: Script kiểm tra nhanh.
