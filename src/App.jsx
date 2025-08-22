import DetailViolation from "./pages/bk/DetailViolation";
import AddViolation from "./pages/bk/AddViolation";
import AddAchievement from "./pages/bk/AddAchievement";
import DashboardBK from "./pages/bk/DashboardBK";
import ExportViolations from "./pages/bk/ExportViolations";
import RekapLaporan from "./pages/bk/RekapLaporan";
import KelolaViolations from "./pages/bk/KelolaViolations";
import KelolaAchievements from "./pages/bk/KelolaAchievements";
import MonitoringSiswa from "./pages/bk/MonitoringSiswa";
import DetailMonitoringSiswa from "./pages/bk/DetailSiswa";
import ManajemenResiko from "./pages/bk/ManajemenResiko";
import AdjustmentPoin from "./pages/bk/AdjustmentPoin";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import SiswaDashboard from "./pages/siswa/SiswaDashboard";
// Import all superadmin components from the new structured folders
import {
  DetailSiswa,
  ImportSiswa,
  KelolaKelas,
  DetailKelas,
  KelolaGuru,
  DetailGuru,
  KelolaAngkatan,
  DetailAngkatan,
  KelolaViolation,
} from "./pages/superadmin";

import {
  LaporanPelanggaran,
  RekapHistori,
  DetailLaporan,
  TambahLaporan,
  EditLaporan,
} from "./pages/reports";

import { KelolaPelanggaran, KelolaPrestasi, Kategori } from "./pages/master";
import PilihKelas from "./pages/superadmin/users/students/PilihKelas";
import DaftarSiswa from "./pages/superadmin/users/students/DaftarSiswa";
import SiswaNotifikasi from "./pages/siswa/SiswaNotifikasi";
import SiswaProfile from "./pages/siswa/SiswaProfile";
import DashboardGuru from "./pages/guru/DashboardGuru";
import ReportsGuru from "./pages/guru/ReportsGuru";
import ProfileGuru from "./pages/guru/ProfileGuru";
import SuperadminAcademicYear from "./pages/SuperadminAcademicYear";
import KenaikanKelas from "./pages/superadmin/KenaikanKelas";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/superadmin/pilih-kelas"
          element={
            <MainLayout>
              <PilihKelas />
            </MainLayout>
          }
        />
        <Route
          path="/superadmin/kelola-siswa/:kelasId"
          element={
            <MainLayout>
              <DaftarSiswa />
            </MainLayout>
          }
        />
        <Route
          path="/superadmin/kelola-pelanggaran"
          element={
            <MainLayout>
              <KelolaPelanggaran />
            </MainLayout>
          }
        />
        <Route
          path="/superadmin/kelola-prestasi"
          element={
            <MainLayout>
              <KelolaPrestasi />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/kategori"
          element={
            <MainLayout>
              <Kategori />
            </MainLayout>
          }
        />

        <Route
          path="/siswa/dashboard"
          element={
            <MainLayout>
              <SiswaDashboard />
            </MainLayout>
          }
        />
        <Route
          path="/superadmin/detail-siswa/:id"
          element={
            <MainLayout>
              <DetailSiswa />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/kelola-guru"
          element={
            <MainLayout>
              <KelolaGuru />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/detail-guru"
          element={
            <MainLayout>
              <DetailGuru />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/kelola-kelas"
          element={
            <MainLayout>
              <KelolaKelas />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/detail-kelas"
          element={
            <MainLayout>
              <DetailKelas />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/kelola-angkatan"
          element={
            <MainLayout>
              <KelolaAngkatan />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/detail-angkatan"
          element={
            <MainLayout>
              <DetailAngkatan />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/tahun-ajaran"
          element={
            <MainLayout>
              <SuperadminAcademicYear />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/kenaikan-kelas"
          element={
            <MainLayout>
              <KenaikanKelas />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/kelola-violation"
          element={
            <MainLayout>
              <KelolaViolation />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/add-achievement"
          element={
            <MainLayout>
              <AddAchievement />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/add-violation"
          element={
            <MainLayout>
              <AddViolation />
            </MainLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <MainLayout>
              <LaporanPelanggaran />
            </MainLayout>
          }
        />

        <Route
          path="/reports/detail/:reportId"
          element={
            <MainLayout>
              <DetailLaporan />
            </MainLayout>
          }
        />

        <Route
          path="/reports/add"
          element={
            <MainLayout>
              <TambahLaporan />
            </MainLayout>
          }
        />

        <Route
          path="/reports/edit/:reportId"
          element={
            <MainLayout>
              <EditLaporan />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/laporan-pelanggaran"
          element={
            <MainLayout>
              <LaporanPelanggaran />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/rekap-historis"
          element={
            <MainLayout>
              <RekapHistori />
            </MainLayout>
          }
        />

        <Route
          path="/import-siswa"
          element={
            <MainLayout>
              <ImportSiswa />
            </MainLayout>
          }
        />

        <Route
          path="/siswa/notifikasi"
          element={
            <MainLayout>
              <SiswaNotifikasi />
            </MainLayout>
          }
        />

        <Route
          path="/siswa/profile"
          element={
            <MainLayout>
              <SiswaProfile />
            </MainLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/kelola-prestasi"
          element={
            <MainLayout>
              <KelolaPrestasi />
            </MainLayout>
          }
        />

        <Route
          path="/bk/student-violations/:id"
          element={
            <MainLayout>
              <DetailViolation />
            </MainLayout>
          }
        />

        <Route
          path="/bk/add-violation"
          element={
            <MainLayout>
              <AddViolation />
            </MainLayout>
          }
        />

        <Route
          path="/bk/dashboard"
          element={
            <MainLayout>
              <DashboardBK />
            </MainLayout>
          }
        />

        <Route
          path="/bk/tambah-laporan"
          element={
            <MainLayout>
              <TambahLaporan />
            </MainLayout>
          }
        />

        <Route
          path="/bk/export-violations"
          element={
            <MainLayout>
              <ExportViolations />
            </MainLayout>
          }
        />

        <Route
          path="/bk/add-achievement"
          element={
            <MainLayout>
              <AddAchievement />
            </MainLayout>
          }
        />

        {/* New BK Routes */}
        <Route
          path="/bk/laporan-siswa"
          element={
            <MainLayout>
              <LaporanPelanggaran />
            </MainLayout>
          }
        />

        <Route
          path="/bk/rekap-laporan"
          element={
            <MainLayout>
              <RekapLaporan />
            </MainLayout>
          }
        />

        <Route
          path="/bk/kelola-pelanggaran"
          element={
            <MainLayout>
              <KelolaPelanggaran />
            </MainLayout>
          }
        />

        <Route
          path="/bk/kelola-prestasi"
          element={
            <MainLayout>
              <KelolaPrestasi />
            </MainLayout>
          }
        />

        <Route
          path="/bk/kelola-kategori"
          element={
            <MainLayout>
              <Kategori />
            </MainLayout>
          }
        />

        <Route
          path="/bk/monitoring-siswa"
          element={
            <MainLayout>
              <MonitoringSiswa />
            </MainLayout>
          }
        />

        <Route
          path="/bk/siswa/:studentId"
          element={
            <MainLayout>
              <DetailMonitoringSiswa />
            </MainLayout>
          }
        />

        <Route
          path="/bk/manajemen-resiko"
          element={
            <MainLayout>
              <ManajemenResiko />
            </MainLayout>
          }
        />

        <Route
          path="/bk/adjustment-poin"
          element={
            <MainLayout>
              <AdjustmentPoin />
            </MainLayout>
          }
        />

        <Route
          path="/guru/dashboard"
          element={
            <MainLayout>
              <DashboardGuru />
            </MainLayout>
          }
        />

        <Route
          path="/guru/reports"
          element={
            <MainLayout>
              <ReportsGuru />
            </MainLayout>
          }
        />

        <Route
          path="/guru/profile"
          element={
            <MainLayout>
              <ProfileGuru />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
