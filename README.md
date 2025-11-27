# Kedai Bunda POS System

Sistem Point of Sale (POS) untuk Kedai Bunda dengan manajemen stok bahan baku, menu, dan transaksi.

## 🏗️ Monorepo Structure

Proyek ini menggunakan **Turborepo** untuk mengelola multiple aplikasi dalam satu repository.

```
kedai-bunda-pwa/
├── apps/
│   ├── api/              # Laravel API (PHP 8.2+)
│   └── web/              # Vite + React + TypeScript
├── turbo.json           # Turbo configuration
└── package.json         # Root workspace
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ dan npm 9+
- **PHP** 8.2+
- **Composer** 2.x
- **SQLite** atau **MySQL** 8.0+
- **Turbo** (akan diinstall otomatis)

### Installation

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd kedai-bunda-pwa
   ```

2. **Install root dependencies**

   ```bash
   npm install
   ```

3. **Setup API (Laravel)**

   ```bash
   cd apps/api
   composer install
   cp .env.example .env
   php artisan key:generate

   # Setup database di .env (sudah pake SQLite by default)
   php artisan migrate --seed
   php artisan jwt:secret
   php artisan l5-swagger:generate
   ```

4. **Setup Web (Vite + React)**
   ```bash
   cd apps/web
   npm install
   ```

### Development

**Jalankan semua apps sekaligus (Recommended):**

```bash
npm run dev
```

**Atau jalankan terpisah:**

API:

```bash
npm run api
# atau
cd apps/api && php artisan serve
```

Web:

```bash
npm run web
# atau
cd apps/web && npm run dev
```

### Build Production

```bash
npm run build
```

## 📱 Applications

### API (Laravel)

- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/documentation
- **Tech Stack**: Laravel 11, JWT Auth, SQLite

**Fitur:**

- Authentication (Login/Logout/Register)
- Manajemen Bahan Baku + Konversi
- Manajemen Menu + Komposisi
- Transaksi dengan auto-deduct stok
- Dashboard & Laporan
- User Management (Super Admin)

### Web (Vite + React)

- **URL**: http://localhost:5173
- **Tech Stack**: Vite, React 18, TypeScript, TailwindCSS v4, Radix UI

**Fitur:**

- 8 Tema warna dengan light/dark mode
- Dashboard dengan statistik
- CRUD Bahan Baku & Menu
- Transaksi real-time
- Responsive design

## 🎨 Themes

Aplikasi menyediakan 8 tema:

- Blue Ocean
- Ruby Red
- Amber Minimal
- Amethyst Haze
- Art Deco
- Catppuccin
- Nature Green
- Ocean Breeze

Setiap tema memiliki variant light & dark.

## 📚 Documentation

- [API Documentation](apps/api/doc/API_DOCUMENTATION.md)
- [Swagger UI](http://localhost:8000/api/documentation)
- [Proses Bisnis](apps/api/doc/todolist.txt)

## 🔧 Useful Commands

```bash
# Development
npm run dev              # Run all apps
npm run api              # Run API only
npm run web              # Run web only

# Build
npm run build            # Build all apps

# Lint & Format
npm run lint             # Lint all code
npm run format           # Format with Prettier

# Clean
npm run clean            # Clean all build artifacts
```

## 📝 Environment Variables

### API (.env)

```env
APP_NAME="Kedai Bunda POS"
APP_ENV=local
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite

JWT_SECRET=<generated-secret>
JWT_TTL=10080  # 7 days in minutes
```

### Web (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## 👥 Default Users

Setelah migration & seeding:

**Super Admin:**

- Email: `super@kedaibunda.com`
- Password: `password`

**Admin:**

- Email: `admin@kedaibunda.com`
- Password: `password`

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is private and proprietary.

## 📧 Contact

Kedai Bunda - admin@kedaibunda.com

---

Made with ❤️ using Turborepo
