import TambahLaporan from "./pages/bk/TambahLaporan";
import StudentViolation from "./pages/bk/StudentViolation";
import DetailViolation from "./pages/bk/DetailViolation";
import AddViolation from "./pages/bk/AddViolation";
import AddAchievement from "./pages/bk/AddAchievement";
import DashboardBK from "./pages/bk/DashboardBK";
import StudentAchievements from "./pages/bk/StudentAchievements";
import ExportViolations from "./pages/bk/ExportViolations";
import LaporanSiswa from "./pages/bk/LaporanSiswa";
import KelolaViolations from "./pages/bk/KelolaViolations";
import KelolaAchievements from "./pages/bk/KelolaAchievements";
import MonitoringSiswa from "./pages/bk/MonitoringSiswa";
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
  KelolaBK,
  DetailBK,
  KelolaAngkatan,
  DetailAngkatan,
  KelolaViolation,
  KelolaPrestasi,
  LaporanPelanggaran,
  MonitoringPelanggaran,
} from "./pages/superadmin";
import PilihKelas from "./pages/superadmin/users/students/PilihKelas";
import DaftarSiswa from "./pages/superadmin/users/students/DaftarSiswa";
import SiswaNotifikasi from "./pages/siswa/SiswaNotifikasi";
import SiswaProfile from "./pages/siswa/SiswaProfile";
import InputPelanggaran from "./pages/guru/InputPelanggaran";

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
          path="/superadmin/laporan-pelanggaran"
          element={
            <MainLayout>
              <LaporanPelanggaran />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/monitoring-pelanggaran"
          element={
            <MainLayout>
              <MonitoringPelanggaran />
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
          path="/bk/student-violations"
          element={
            <MainLayout>
              <StudentViolation />
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

        <Route
          path="/bk/achievements"
          element={
            <MainLayout>
              <StudentAchievements />
            </MainLayout>
          }
        />

        {/* New BK Routes */}
        <Route
          path="/bk/laporan-siswa"
          element={
            <MainLayout>
              <LaporanSiswa />
            </MainLayout>
          }
        />

        <Route
          path="/bk/kelola-violations"
          element={
            <MainLayout>
              <KelolaViolations />
            </MainLayout>
          }
        />

        <Route
          path="/bk/kelola-achievements"
          element={
            <MainLayout>
              <KelolaAchievements />
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
          path="/guru/input-pelanggaran"
          element={
            <MainLayout>
              <InputPelanggaran />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
