import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import KelolaSiswa from "./pages/superadmin/KelolaSiswa";
import Layout from "./layouts/MainLayout";
import ImportSiswa from "./pages/superadmin/ImportSiswa";
import KelolaKelas from "./pages/superadmin/KelolaKelas";
import KelolaGuru from "./pages/superadmin/KelolaGuru";
import KelolaBK from "./pages/superadmin/KelolaBK";

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
          path="/superadmin/kelola-guru"
          element={
            <Layout>
              <KelolaGuru />
            </Layout>
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

        <Route path="/import-siswa" element={<ImportSiswa />} />
        <Route path="/superadmin/kelola-kelas" element={<KelolaKelas />} />
        <Route path="/superadmin/kelola-guru" element={<KelolaGuru />} />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
