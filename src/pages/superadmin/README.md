# SuperAdmin Pages Structure

Struktur folder untuk halaman SuperAdmin telah direorganisasi berdasarkan fungsi untuk meningkatkan maintainability dan readability kode.

## Struktur Folder Baru

```
src/pages/superadmin/
├── index.js                    # Main export file untuk semua komponen
├── users/                      # Manajemen Pengguna
│   ├── index.js               # Export semua user components
│   ├── students/              # Manajemen Siswa
│   │   ├── index.js
│   │   ├── KelolaSiswa.jsx
│   │   └── DetailSiswa.jsx
│   ├── teachers/              # Manajemen Guru
│   │   ├── index.js
│   │   ├── KelolaGuru.jsx
│   │   └── DetailGuru.jsx
│   ├── bk/                    # Manajemen BK
│   │   ├── index.js
│   │   ├── KelolaBK.jsx
│   │   └── DetailBK.jsx
│   └── angkatan/              # Manajemen Angkatan
│       ├── index.js
│       ├── KelolaAngkatan.jsx
│       └── DetailAngkatan.jsx
├── academic/                   # Manajemen Akademik
│   ├── index.js               # Export semua academic components
│   ├── classes/               # Manajemen Kelas
│   │   ├── index.js
│   │   ├── KelolaKelas.jsx
│   │   └── DetailKelas.jsx
│   └── achievements/          # Manajemen Prestasi
│       ├── index.js
│       └── KelolaPrestasi.jsx
├── violations/                 # Manajemen Pelanggaran
│   ├── index.js
│   ├── KelolaViolation.jsx
│   └── CategoryViolation.jsx
├── reports/                    # Laporan dan Monitoring
│   ├── index.js
│   ├── LaporanPelanggaran.jsx
│   └── MonitoringPelanggaran.jsx
└── import/                     # Import Data
    ├── index.js
    └── ImportSiswa.jsx
```

## Cara Penggunaan

### Import Individual Components

```javascript
import { KelolaSiswa } from "./pages/superadmin/users/students";
import { KelolaKelas } from "./pages/superadmin/academic/classes";
```

### Import Multiple Components from Category

```javascript
import { KelolaSiswa, DetailSiswa } from "./pages/superadmin/users/students";
import { KelolaKelas, DetailKelas } from "./pages/superadmin/academic/classes";
```

### Import All SuperAdmin Components

```javascript
import {
  KelolaSiswa,
  DetailSiswa,
  KelolaGuru,
  DetailGuru,
  KelolaKelas,
  DetailKelas,
  // ... dll
} from "./pages/superadmin";
```

## Keuntungan Struktur Baru

1. **Organisasi yang Lebih Baik**: File dikelompokkan berdasarkan fungsi dan domain
2. **Maintainability**: Mudah mencari dan memelihara file terkait
3. **Scalability**: Mudah menambahkan fitur baru dalam kategori yang tepat
4. **Reusability**: Index files memudahkan import dan export komponen
5. **Clean Imports**: Import statements menjadi lebih bersih dan terorganisir

## File yang Telah Dipindahkan

- **Users Management**: KelolaSiswa, DetailSiswa, KelolaGuru, DetailGuru, KelolaBK, DetailBK, KelolaAngkatan, DetailAngkatan
- **Academic Management**: KelolaKelas, DetailKelas, KelolaPrestasi
- **Violations Management**: KelolaViolation, CategoryViolation
- **Reports**: LaporanPelanggaran, MonitoringPelanggaran
- **Import**: ImportSiswa
