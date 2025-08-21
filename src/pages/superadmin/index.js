// SuperAdmin Pages - Main index for all superadmin components
// Import from organized folders
export * from "./users";
export * from "./academic";
export * from "./academic/violations";
export * from "./reports";
export * from "./import";

// Re-export individual components for backward compatibility
export { PilihKelas, DaftarSiswa, DetailSiswa } from "./users/students";
export { KelolaGuru, DetailGuru } from "./users/teachers";
export { KelolaAngkatan, DetailAngkatan } from "./academic/angkatan";
export { KelolaKelas, DetailKelas } from "./academic/classes";
export { KelolaPrestasi } from "./academic/achievements";
export { KelolaViolation } from "./academic/violations";
export { LaporanPelanggaran, RekapHistori } from "./reports";
export { ImportSiswa } from "./import";
