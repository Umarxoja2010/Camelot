# 🎓 Camelot LMS — O'quv markaz va maktab boshqaruv tizimi

Ko'p tilli (uz / ru / en) o'quv markaz + maktab boshqaruv platformasi. **4 rol** bir tizimda bog'lanadi: **Admin, O'qituvchi, O'quvchi, Ota-ona**.

> **Holat:** Backend REST API **va** to'liq responsiv React frontend (4 rol uchun panellar) tayyor.

| Qatlam | Texnologiya |
|--------|-------------|
| **Backend** | Laravel 11 (REST API), Sanctum (token auth), SQLite/MySQL |
| **Frontend** | React 18 + TypeScript, Vite, Tailwind CSS, react-i18next (responsiv) |

---

## ✨ Imkoniyatlar (backend tayyor)

- 🔐 **Rollar**: admin / o'qituvchi / o'quvchi / ota-ona (token-based auth, hisoblar admin tomonidan ochiladi)
- 🌍 **Ko'p tillilik**: kurs nomi, tavsifi, e'lonlar — uz/ru/en (JSON, `X-Locale` header)
- 📚 **Kurslar va guruhlar**: ingliz tili darajalari (A1, IELTS...) yoki maktab fanlari (5-sinf). O'qituvchi biriktirish, o'quvchi yozish, dars jadvali
- ✅ **Davomat**: o'qituvchi belgilaydi, o'quvchi/ota-ona ko'radi
- 📝 **Baholar**: test/uy vazifasi/imtihon natijalari (foiz bilan)
- 💳 **To'lovlar**: admin karta raqamlarini boshqaradi → o'quvchi chek rasmini yuklaydi → admin tasdiqlaydi/rad etadi
- 📢 **E'lonlar**: auditoriya bo'yicha (hammaga / o'qituvchilarga / o'quvchilarga / ota-onalarga / guruhga)
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
| Ota-ona | `parent1@camelot.uz`, `parent2@camelot.uz` |

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

**O'quvchi** (`/student`, role:student):
- `GET /groups`, `GET /attendance`, `GET /grades`
- `GET /payment-cards`, `GET /payments`, `POST /payments` (chek yuklash)

**Ota-ona** (`/parent`, role:parent):
- `GET /children`, `GET /children/{child}/groups|attendance|grades`

---

## 🎨 Frontend'ni ishga tushirish

> Talab: Node.js ≥ 18, npm

```bash
cd frontend

npm install
cp .env.example .env        # VITE_API_URL=http://localhost:8000/api

npm run dev                 # http://localhost:5173
```

Brauzerda **http://localhost:5173** ni oching va demo hisob bilan kiring.
Har bir rol o'z paneliga avtomatik yo'naltiriladi:

| Rol | Panel imkoniyatlari |
|-----|---------------------|
| 🛡️ **Admin** | Statistika, foydalanuvchilar, kurslar, guruhlar (jadval + o'quvchi yozish), to'lovlar (chek ko'rish + tasdiqlash), to'lov kartalari, e'lonlar |
| 👨‍🏫 **O'qituvchi** | Guruhlarim, davomat belgilash, baho qo'yish |
| 🎓 **O'quvchi** | Guruhlarim, davomat, baholar, to'lov (chek yuklash) |
| 👪 **Ota-ona** | Farzandlar, ularning guruh/davomat/baholari |

Interfeys uch tilda (uz/ru/en), to'liq responsiv (mobil + planshet + desktop).

---

## 🗺️ Keyingi bosqichlar

- [x] Backend (Laravel REST API)
- [x] Frontend (React) — har rol uchun panel, responsiv
- [ ] Chat (o'quvchi ↔ o'qituvchi ↔ ota-ona)
- [ ] Uy vazifalari (fayl yuklash)
- [ ] Online to'lov (Payme/Click)
- [ ] Hisobotlar (Excel/PDF)
