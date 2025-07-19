// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LayoutBK from "./layouts/layoutBK";
import DashboardBK from "./pages/bk/DashboardBK";
import LayoutSiswa from "./layouts/layoutSiswa";
import DashboardSiswa from "./pages/siswa/DashboardSiswa";
import LayoutGuru from "./layouts/layoutGuru";
import DashboardGuru from "./pages/guru/DashboardGuru";
import InputCreditScore from "./pages/guru/InputCreditScore";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/bk" element={<LayoutBK />}>
          <Route path="dashboard" element={<DashboardBK />} />
        </Route>

        <Route path="/siswa" element={<LayoutSiswa />}>
          <Route path="dashboard" element={<DashboardSiswa />} />
        </Route>

        <Route path="/guru" element={<LayoutGuru />}>
          <Route path="dashboard" element={<InputCreditScore />} />
        </Route>

        
      </Routes>
    </Router>
  );
};

export default App;
