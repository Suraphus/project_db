# Ku facility (Sport Facility Lobby Joining System)

ใช้ **Flask + MySQL + MongoDB** (Backend) และ **React + Vite** (Frontend) รันผ่าน Docker

---

## Project Structure

```
project_db/
├── backend/
│   ├── main.py               # Flask app & API routes
│   ├── init_db.sql           # MySQL schema, triggers & stored procedures
│   ├── db_sql.py             # MySQL connection helper
│   ├── db_mongo.py           # MongoDB connection helper
│   ├── log.py                # Logging utility
│   ├── test_db.py            # Database tests
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env                  # Environment variables (ไม่ commit)
└── frontend/
    ├── src/
    │   └── pages/            # React pages (AdminPage, BookingPage, ...)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS        |
| Backend    | Python, Flask, Flask-CORS           |
| SQL DB     | MySQL                               |
| NoSQL DB   | MongoDB                             |
| Container  | Docker, Docker Compose              |

---

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- Node.js v18+ (สำหรับรัน frontend)

---

## How to Run

### วิธีที่ 1: Docker (แนะนำ)

```bash
# 1. สร้างไฟล์ .env ใน backend/ (ดูหัวข้อ Environment Variables)

# 2. รัน Docker Compose
cd backend
docker compose up -d
```

services ที่จะถูกรัน:
- **MySQL** → `localhost:3307`
- **MongoDB** → `localhost:27017`
- **Backend (Flask)** → `localhost:6500`

### วิธีที่ 2: รัน Manual

**Backend**
```bash
cd backend
python -m venv myvenv
source myvenv/bin/activate       # Windows: myvenv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Access URLs

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:5173    |
| Backend  | http://localhost:6500    |
| MySQL    | localhost:3307           |
| MongoDB  | localhost:27017          |

---

## Environment Variables

สร้างไฟล์ `backend/.env` ดังนี้:

```env
port=6500
DOCKER_PASSWORD=your_password_here
```


---

## Database Schema (MySQL)

| Table               | Description                              |
|---------------------|------------------------------------------|
| `user`              | ข้อมูล user (admin / student)              |
| `profile_student`   | ข้อมูลโปรไฟล์นักศึกษา                         |
| `courts`            | ข้อมูลสนาม (ชื่อ, ประเภท, สถานะ)             |
| `time_slot`         | ช่วงเวลาที่เปิดให้จอง                         |
| `lobby_time_slot`   | ความจุของสนามในแต่ละช่วงเวลา                |
| `booking`           | ประวัติการจองสนาม                          |

### Stored Procedure
- **`make_booking(user_id, court_id, time_slot_id, date)`** — จองสนาม พร้อมตรวจสอบว่าสนามเต็มหรือไม่

### Triggers
- `set_max_pp_in_lobby_time_slot` — ตั้ง max_pp อัตโนมัติเมื่อเพิ่ม lobby_time_slot
- `update_cur_pp_after_booking` — เพิ่ม cur_pp เมื่อมีการจอง
- `update_cur_pp_after_delete` — ลด cur_pp เมื่อลบการจอง

---

## Features

- ระบบ Login / Register (Student & Admin)
- ดูและจองสนามกีฬา
- เลือกวันและช่วงเวลา
- Admin Dashboard จัดการสนามและข้อมูล
- ตรวจสอบสนามเต็มแบบ real-time ผ่าน transaction

---

## By

- Nuttasit Kuaseng
- Suraphus Chanthawong
- Kittichet Piriyapanyaporn
- Banpot Brahmasaka na sakolnakhon
