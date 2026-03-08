# Bulletin Board API

Платформа для розміщення оголошень з функціями спілкування, відзивів, верифікації та модерації.

## 📋 Опис системи

Це REST API додаток для онлайн дошки оголошень (Bulletin Board), побудований на **FastAPI**. Система дозволяє користувачам:

- 📝 Створювати та керувати оголошеннями
- 💬 Спілкуватися з іншими користувачами через чат
- ⭐ Залишати відзиви та рейтинги
- ✅ Верифікувати профіль
- 🛡️ Блокувати підозрілих користувачів
- 📊 Адміністраторам модерувати контент та користувачів

## 🏗️ Архітектура

```
┌─────────────────────────┐
│  PRESENTATION LAYER     │
│  (FastAPI Routers)      │
│  - users.py             │
│  - posts.py             │
│  - chat.py              │
│  - reviews.py           │
│  - admin.py             │
│  - verification.py      │
└────────────┬────────────┘
             │
┌────────────▼─────────────┐
│   SERVICE LAYER         │
│  (Business Logic)       │
│  - user_service.py      │
│  - post_service.py      │
│  - chat_service.py      │
│  - review_service.py    │
│  - admin_service.py     │
│  - verification_service │
└────────────┬─────────────┘
             │
┌────────────▼──────────────┐
│  DATA ACCESS LAYER       │
│  (Repositories)          │
│  - user_repo.py          │
│  - post_repo.py          │
│  - chat_repo.py          │
└──────────────────────────┘
             │
┌────────────▼──────────────┐
│  DATABASE LAYER          │
│  (SQLite)                │
│  - SQLAlchemy ORM        │
│  - models.py             │
└──────────────────────────┘
```

### Шари архітектури:

1. **Presentation (Routers)** - HTTP ендпоінти
   - Обробляють HTTP запити
   - Валідують вхідні дані через Pydantic schemas
   - Повертають JSON відповіді
   - **НЕ звертаються напрямки до БД**

2. **Service (Services)** - Бізнес-логіка
   - Реалізують основну логіку додатку
   - Використовують repositories для доступу до даних
   - Працюють з часовими поясами, конвертацією, відправкою листів тощо
   - Повертають бізнес-об'єкти

3. **Data Access (Repositories)** - Доступ до даних
   - Інкапсулюють SQL запити
   - Працюють тільки з SQLAlchemy моделями
   - Забезпечують єдину точку доступу до БД

4. **Models** - ORM моделі
   - Визначають структуру таблиць
   - Відносини між сутностями
   - Перерахування (Enum) для констант

5. **Schemas** - Pydantic моделі
   - Валідація вхідних даних
   - Серіалізація відповідей
   - Документація через FastAPI

## 📁 Структура проекту

```
test/
├── database/
│   └── database.py
├── models/
│   └── models.py
├── schemas/
│   └── schemas.py
├── routers/
│   ├── users.py
│   ├── posts.py
│   ├── chat.py
│   ├── reviews.py
│   ├── admin.py
│   └── verification.py
├── services/
│   ├── user_service.py
│   ├── post_service.py
│   ├── chat_service.py
│   ├── review_service.py
│   ├── admin_service.py
│   └── verification_service.py
├── repositories/
│   ├── user_repo.py
│   ├── post_repo.py
│   └── chat_repo.py
├── utils/
│   └── utils.py
├── main.py
├── config.py
├── requirements.txt
└── README.md
```

## 🗄️ Моделі даних

### User
- Основна інформація (ім'я, прізвище, пошта, телефон)
- Статуси (верифікований, заблокований, підтверджена пошта)
- Профіль (аватар, локація, рейтинг)
- Ролі (User, Admin, Owner)

### Post
- Назва, опис, ціна
- Категорія, теги
- Статуси (закрито, просунуто, шахрайство)
- Валюта, локація
- Зображення (base64)

### Chat
- Діалоги між користувачами
- Повідомлення з часовими позначками

### Review
- Оцінка (1-5)
- Текст відзиву
- Продавець та автор відзиву

### VerificationRequest
- Зображення документів
- Статус (pending, approved, rejected)

## 🚀 Як запустити

### Вимоги
- Python 3.8+
- FastAPI, SQLAlchemy, Pydantic
- SQLite
- SMTP доступ для відправки листів

### Встановлення залежностей

```bash
pip install -r requirements.txt
```

### Конфігурація

Відредагуйте **config.py**:
```python
SECRET_KEY = "ваш-секретний-ключ"
SMTP_USER = "ваша-пошта@gmail.com"
SMTP_PASS = "пароль-додатку"
DATABASE_URL = "sqlite:///bulletin_board.db"
BASE_URL = "http://127.0.0.1:8000"
```

### Запуск сервера

```bash
python database/database.py

uvicorn main:app --reload

uvicorn main:app --port 8000 --reload
```

Сервер буде доступний за адресою: **http://localhost:8000**

**API документація (Swagger)**: http://localhost:8000/docs

## 📚 API Ендпоінти

### Користувачі
- `POST /register` - Реєстрація
- `POST /login` - Вхід
- `POST /categories/favorite/{category_id}` - Додати категорію в улюблене
- `DELETE /categories/favorite/{category_id}` - Видалити з улюбленого

### Оголошення
- `GET /posts` - Список всіх оголошень
- `GET /posts/{post_id}` - Отримати оголошення
- `POST /posts` - Створити оголошення
- `POST /posts/{post_id}/close` - Закрити оголошення

### Чат
- `GET /chat/my` - Мої діалоги
- `GET /chat/with/{other_user_id}` - Діалог з користувачем
- `POST /chat/send` - Відправити повідомлення

### Відзиви
- `GET /reviews/{seller_id}` - Відзиви продавця
- `GET /my/reviews` - Мої відзиви
- `POST /reviews` - Залишити відзив

### Верифікація
- `POST /verification/request` - Подати заявку на верифікацію
- `GET /verification/requests` - Отримати всі заявки (Admin)
- `PUT /verification/requests/{request_id}` - Обробити заявку (Admin)

### Адміністрування
- `GET /admin/users` - Всі користувачі
- `GET /admin/posts` - Всі оголошення
- `DELETE /admin/users/{user_id}` - Видалити користувача
- `DELETE /admin/posts/{post_id}` - Видалити оголошення
- `POST /admin/categories` - Додати категорію
- `DELETE /admin/categories/{category_id}` - Видалити категорію

## 🔐 Безпека

- JWT токени для аутентифікації
- Хешування паролів (bcrypt)
- CORS конфігурація для фронтенду
- Доступ на основі ролей (RBAC)
- Верифікація акаунту через пошту

## 📧 Відправка листів

Система відправляє листи через SMTP:
- Верифікація пошти при реєстрації
- Скидання пароля
- Сповіщення про нові оголошення в улюблених категоріях

## 💾 База даних

SQLite база даних з таблицями:
- `users` - Користувачі
- `posts` - Оголошення
- `messages` - Повідомлення чату
- `dialogues` - Діалоги
- `reviews` - Відзиви
- `complaints` - Скарги
- `verification_requests` - Заявки на верифікацію
- `categories` - Категорії
- `favorite_categories` - Улюблені категорії
- `admins` - Адміністратори

## 🐳 Docker

Для запуску в Docker:

```bash
docker build -t bulletin-board .
docker run -p 8000:8000 bulletin-board
```

## 📝 Нотатки розробника

- Всі операції з БД проходять через repositories
- Всі HTTP запити обробляються маршрутами
- Services містять всю бізнес-логіку
- Пам'ятайте про трьохшарову архітектуру при додаванні нових функцій
- Використовуйте послідовне найменування (snake_case)

## 🎯 Плани розвитку

- [ ] Пошук за продвинутими фільтрами
- [ ] Система рекомендацій
- [ ] Rich media (відео, аудіо)
- [ ] Сповіщення в реальному часі (WebSocket)
- [ ] Інтеграція з платіжними системами
- [ ] Мобільний додаток

---

**Створено як навчальний проект у рамках курсу.**
