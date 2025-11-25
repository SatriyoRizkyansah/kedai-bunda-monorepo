# Theme Switcher Hook

Hook untuk mengubah tema CSS di aplikasi Hermes.

## Fitur

- ✅ 60+ tema yang siap pakai
- ✅ Kategori tema terorganisir (Brand, Color, Nature, Style, dll.)
- ✅ Persistent theme di localStorage
- ✅ TypeScript support penuh
- ✅ Komponen siap pakai (Dropdown & Simple Select)
- ✅ SSR safe

## Instalasi

Hook sudah tersedia di `app/templates/themes/hook.ts`

## Penggunaan

### 1. Menggunakan Hook Dasar

```tsx
import { useThemeSwitcher } from "~/templates/themes/hook";

function MyComponent() {
  const { currentTheme, setTheme, themes } = useThemeSwitcher();

  return (
    <div>
      <p>Current Theme: {currentTheme}</p>
      <button onClick={() => setTheme("blue")}>
        Switch to Blue
      </button>
    </div>
  );
}
```

### 2. Menggunakan Komponen ThemeSwitcher (Dropdown)

```tsx
import { ThemeSwitcher } from "~/templates/components/custom/theme-switcher";

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeSwitcher />
    </header>
  );
}
```

### 3. Menggunakan ThemeSwitcherCard (Gallery with Color Preview) ⭐ RECOMMENDED

```tsx
import { ThemeSwitcherCard } from "~/templates/components/custom/theme-switcher";

function SettingsPage() {
  return (
    <div className="container">
      <h1>Choose Your Theme</h1>
      {/* Shows theme gallery with color palette preview */}
      <ThemeSwitcherCard />
    </div>
  );
}
```

**ThemeSwitcherCard Features:**
- 🎨 Visual color palette preview untuk setiap tema
- 🔍 Search bar untuk mencari tema
- 🏷️ Category tabs untuk filter tema
- ✅ Active state indicator
- 📱 Responsive grid layout

### 4. Menggunakan SimpleThemeSwitcher

```tsx
import { SimpleThemeSwitcher } from "~/templates/components/custom/theme-switcher";

function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      <SimpleThemeSwitcher />
    </div>
  );
}
```

### 4. Custom Implementation dengan Kategori

```tsx
import { 
  useThemeSwitcher, 
  themeCategories,
  getThemeDisplayName 
} from "~/templates/themes/hook";

function ThemeGrid() {
  const { currentTheme, setTheme } = useThemeSwitcher();

  return (
    <div>
      <h3>Brand Themes</h3>
      <div className="grid grid-cols-4 gap-2">
        {themeCategories.brand.map((theme) => (
          <button
            key={theme}
            onClick={() => setTheme(theme)}
            className={currentTheme === theme ? "active" : ""}
          >
            {getThemeDisplayName(theme)}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## API Reference

### `useThemeSwitcher()`

Hook utama untuk mengelola tema.

**Returns:**
```typescript
{
  currentTheme: ThemeName;        // Tema saat ini
  setTheme: (theme: ThemeName) => void;  // Fungsi untuk mengubah tema
  themes: readonly ThemeName[];   // Array semua tema tersedia
}
```

### `getThemeDisplayName(theme: ThemeName)`

Mengonversi nama tema ke format yang lebih user-friendly.

**Example:**
```typescript
getThemeDisplayName("ocean-breeze")  // "Ocean Breeze"
getThemeDisplayName("bold.tech")     // "Bold.Tech"
```

### `themes`

Array const berisi semua nama tema yang tersedia.

### `themeCategories`

Object berisi tema yang dikelompokkan berdasarkan kategori:

- `brand` - Tema brand terkenal (Spotify, Twitter, Slack, dll.)
- `color` - Tema warna dasar (Blue, Green, Orange, dll.)
- `nature` - Tema alam (Ocean Breeze, Starry Night, dll.)
- `style` - Tema gaya desain (Neo Brutalism, Cyberpunk, dll.)
- `aesthetic` - Tema estetika (Pastel Dreams, Bubblegum, dll.)
- `professional` - Tema profesional (Corporate, Clean State, dll.)
- `gaming` - Tema gaming (Valorant, Doom 64)
- `other` - Tema lainnya

## Daftar Tema

### Brand (7 tema)
- Spotify, Twitter, Slack, Supabase, Vercel, VSCode, Marvel

### Color (8 tema)
- Blue, Green, Orange, Red, Rose, Violet, Yellow, Tangerine

### Nature (7 tema)
- Ocean Breeze, Northern Lights, Starry Night, Summer, Sunset Horizon, Kodama Grove, Ghibli Studio

### Style (8 tema)
- Neo Brutalism, Claymorphism, Cyber Punk, Retro Arcade, Art Deco, Vintage Paper, Material Design, Modern Minimal

### Aesthetic (10 tema)
- Pastel Dreams, Quantum Rose, Violet Blossom, Amethyst Haze, Midnight Blossom, Mocha Mousse, Bubblegum, Candyland, Marshmallow, Soft Pop

### Professional (7 tema)
- Corporate, Clean State, Perpetuity, Graphite, Mono, Note Book, Elegant Luxury

### Gaming (2 tema)
- Valorant, Doom 64

### Other (10 tema)
- Amber Minimal, Bold.Tech, Caffein, Catppuccin, Claude, Cosmic Night, Dark Matter, Nature, Solar Dusk, T3 Chat

## Kustomisasi

### Mengubah Tema Default

Edit `DEFAULT_THEME` di `hook.ts`:

```typescript
const DEFAULT_THEME: ThemeName = "blue"; // Ubah sesuai keinginan
```

### Mengubah Storage Key

Edit `THEME_STORAGE_KEY` di `hook.ts`:

```typescript
const THEME_STORAGE_KEY = "app-theme"; // Ubah sesuai keinginan
```

### Menambahkan Tema Baru

1. Buat file CSS baru di `app/templates/themes/nama-tema.css`
2. Tambahkan nama tema ke array `themes` di `hook.ts`
3. Tambahkan ke kategori yang sesuai di `themeCategories`

## Komponen

### ThemeSwitcher

Komponen dropdown dengan kategorisasi tema.

**Props:** Tidak ada (menggunakan Button dengan icon Palette)

**Features:**
- Dropdown menu dengan submenu untuk setiap kategori
- Visual indicator (✓) untuk tema aktif
- Auto-close setelah memilih tema
- Menampilkan tema saat ini di bagian bawah

### SimpleThemeSwitcher

Komponen select sederhana untuk pemilihan tema.

**Props:** Tidak ada

**Features:**
- Select dropdown standar
- Semua tema dalam satu list
- Lebih compact dan sederhana

## Tips

1. **Persistent State**: Tema disimpan di localStorage, jadi akan tetap aktif setelah reload
2. **SSR Safe**: Hook menggunakan `typeof window !== "undefined"` untuk kompatibilitas SSR
3. **Performance**: CSS dimuat secara dinamis, hanya tema aktif yang di-load
4. **Type Safety**: Semua tema menggunakan union type untuk autocomplete dan type checking

## Troubleshooting

### Tema tidak berubah

Pastikan file CSS tema tersedia di `/public/themes/` atau sesuaikan path di hook:

```typescript
link.href = `/themes/${themeName}.css`; // Sesuaikan path jika perlu
```

### TypeScript Error

Pastikan menggunakan type `ThemeName` saat set tema:

```typescript
import type { ThemeName } from "~/templates/themes/hook";

const theme: ThemeName = "blue"; // ✅ Correct
setTheme(theme);

setTheme("unknown-theme"); // ❌ Error
```
