import TambahLaporan from "./pages/bk/TambahLaporan";
import StudentViolation from "./pages/bk/StudentViolation";
import DetailViolation from "./pages/bk/DetailViolation";
import AddViolation from "./pages/bk/AddViolation";
import AddAchievement from "./pages/bk/AddAchievement";
import DashboardBK from "./pages/bk/DashboardBK";
import StudentAchievements from "./pages/bk/StudentAchievements";
import ExportViolations from "./pages/bk/ExportViolations";
import CategoryViolation from "./pages/superadmin/CategoryViolation";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import KelolaSiswa from "./pages/superadmin/KelolaSiswa";
import DetailSiswa from "./pages/superadmin/DetailSiswa";
import ImportSiswa from "./pages/superadmin/ImportSiswa";
import KelolaKelas from "./pages/superadmin/KelolaKelas";
import DetailKelas from "./pages/superadmin/DetailKelas";
import KelolaGuru from "./pages/superadmin/KelolaGuru";
import DetailGuru from "./pages/superadmin/DetailGuru";
import KelolaBK from "./pages/superadmin/KelolaBK";
import DetailBK from "./pages/superadmin/DetailBK";
import KelolaAngkatan from "./pages/superadmin/KelolaAngkatan";
import DetailAngkatan from "./pages/superadmin/DetailAngkatan";
import KelolaViolation from "./pages/superadmin/KelolaViolation";
import KelolaPrestasi from "./pages/superadmin/KelolaPrestasi";
import LaporanPelanggaran from "./pages/superadmin/LaporanPelanggaran";
import MonitoringPelanggaran from "./pages/superadmin/MonitoringPelanggaran";
import SiswaCreditScore from "./pages/siswa/SiswaCreditScore";
import InputPelanggaran from "./pages/guru/InputPelanggaran";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/superadmin/kelola-siswa"
          element={
            <MainLayout>
              <KelolaSiswa />
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
          path="/superadmin/kelola-bk"
          element={
            <MainLayout>
              <KelolaBK />
            </MainLayout>
          }
        />

        <Route
          path="/superadmin/detail-bk"
          element={
            <MainLayout>
              <DetailBK />
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
          path="/superadmin/kelola-kategori"
          element={
            <MainLayout>
              <CategoryViolation />
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
          path="/siswa/credit-score"
          element={
            <MainLayout>
              <SiswaCreditScore />
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
