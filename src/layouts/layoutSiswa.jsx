// src/layouts/layoutSiswa.jsx
import { Outlet } from "react-router-dom";
import SidebarSiswa from "../components/SidebarSiswa";

const LayoutSiswa = () => {
  return (
    <div className="flex">
      <SidebarSiswa />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutSiswa;