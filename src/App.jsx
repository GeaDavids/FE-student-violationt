import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import KelolaSiswa from './pages/superadmin/KelolaSiswa';
import Layout from './layouts/MainLayout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/superadmin/kelola-siswa" element={<Layout><KelolaSiswa /></Layout>} />
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
