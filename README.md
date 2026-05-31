# 🎓 Camelot LMS — O'quv markaz boshqaruv tizimi

Ko'p tilli (uz / ru / en) **o'quv markaz** boshqaruv platformasi. **3 rol** bir tizimda bog'lanadi: **Admin, O'qituvchi, O'quvchi**.

> **Holat:** Backend REST API **va** to'liq responsiv React frontend tayyor.

| Qatlam | Texnologiya |
|--------|-------------|
| **Backend** | Laravel 11 (REST API), Sanctum (token auth), SQLite/MySQL |
| **Frontend** | React 18 + TypeScript, Vite, Tailwind CSS, react-i18next (responsiv) |

---

## ✨ Imkoniyatlar

- 🔐 **Rollar**: admin / o'qituvchi / o'quvchi (token-based auth, hisoblar admin tomonidan ochiladi)
- 🌍 **Ko'p tillilik**: kurs nomi, tavsifi, e'lonlar — uz/ru/en (JSON, `X-Locale` header)
- 📚 **Kurslar va guruhlar**: til kursi darajalari (A1, IELTS...), o'qituvchi biriktirish, o'quvchi yozish, dars jadvali
- ✅ **Davomat**: o'qituvchi keldi/kelmadi deb belgilaydi, o'quvchi o'zi ko'radi
- 📝 **Uy vazifalari**: o'qituvchi guruhga vazifa beradi, o'quvchilar ko'radi (+ bildirishnoma)
- 💳 **To'lovlar**: admin karta raqamlarini boshqaradi → o'quvchi chek rasmini yuklaydi → admin tasdiqlaydi/rad etadi (to'lovlar va kartalar bitta bo'limda)
- 📢 **E'lonlar**: auditoriya bo'yicha (hammaga / o'qituvchilarga / o'quvchilarga / guruhga)
- 🔔 **Bildirishnomalar**: ilova ichida + **Telegram bot** va **SMS (Eskiz.uz)** — sozlamada yoqiladi

---

## 🚀 Backend'ni ishga tushirish

> Talab: PHP ≥ 8.2, Composer

```bash
cd backend

composer install
cp .env.example .env
php artisan key:generate

touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link        # chek rasmlari uchun

php artisan serve               # http://localhost:8000
```

### 🔑 Demo hisoblar (parol hammasida: `password`)

| Rol | Email |
|-----|-------|
| Admin | `admin@camelot.uz` |
| O'qituvchi | `teacher1@camelot.uz`, `teacher2@camelot.uz` |
| O'quvchi | `student1@camelot.uz` … `student6@camelot.uz` |

---

## 🔔 Telegram / SMS sozlash (ixtiyoriy)

`.env` faylida:

```env
# Telegram bot (BotFather'dan token)
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=123456:ABC...

# SMS (Eskiz.uz)
SMS_ENABLED=true
ESKIZ_EMAIL=sizning@email.uz
ESKIZ_PASSWORD=parol
```

Yoqilmasa, bildirishnomalar faqat ilova ichida saqlanadi (xato bermaydi).

---

## 📡 Asosiy API endpointlari

Base URL: `http://localhost:8000/api`

**Auth:** `POST /login`, `GET /me`, `PUT /profile`, `POST /logout`

**Umumiy (token):** `GET /announcements`, `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/{id}/read`, `POST /notifications/read-all`

**Admin** (`/admin`, role:admin):
- `GET /dashboard`
- `apiResource users`, `apiResource courses`, `apiResource groups`
- `POST /groups/{group}/enroll`, `DELETE /groups/{group}/students/{studentId}`
- `GET/POST/PUT/DELETE /payment-cards`
- `GET /payments`, `PATCH /payments/{id}/confirm`, `PATCH /payments/{id}/reject`
- `apiResource announcements`

**O'qituvchi** (`/teacher`, role:teacher,admin):
- `GET /groups`, `GET /groups/{group}`
- `GET|POST /groups/{group}/attendance`
- `GET|POST /groups/{group}/grades`, `DELETE /grades/{grade}`
- `GET|POST /groups/{group}/homework`, `DELETE /homework/{homework}`

**O'quvchi** (`/student`, role:student):
- `GET /groups`, `GET /attendance`, `GET /homework`
- `GET /payment-cards`, `GET /payments`, `POST /payments` (chek yuklash)

---

## 🎨 Frontend'ni ishga tushirish

> Talab: Node.js ≥ 18, npm

```bash
cd frontend

npm install
cp .env.example .env        # VITE_API_URL=http://localhost:8000/api

npm run dev                 # http://localhost:5173
```

Har bir rol o'z paneliga avtomatik yo'naltiriladi:

| Rol | Panel imkoniyatlari |
|-----|---------------------|
| 🛡️ **Admin** | Statistika, foydalanuvchilar, kurslar, guruhlar (jadval + o'quvchi yozish), to'lovlar + kartalar (bitta bo'lim), e'lonlar |
| 👨‍🏫 **O'qituvchi** | Guruhlarim → davomat belgilash (keldi/kelmadi), uy vazifasi berish, baho qo'yish |
| 🎓 **O'quvchi** | Guruhlarim, davomat (ko'rish), uy vazifalari, to'lov (chek yuklash) |

Interfeys uch tilda (uz/ru/en), to'liq responsiv (mobil + planshet + desktop).

---

## 🗺️ Keyingi bosqichlar

- [x] Backend (Laravel REST API)
- [x] Frontend (React) — har rol uchun panel, responsiv
- [ ] Chat (o'quvchi ↔ o'qituvchi)
- [ ] Uy vazifasiga fayl biriktirish / topshirish
- [ ] Online to'lov (Payme/Click)
- [ ] Hisobotlar (Excel/PDF)
