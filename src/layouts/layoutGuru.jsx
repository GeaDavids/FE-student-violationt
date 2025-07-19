import SidebarGuru from "../components/SidebarGuru";
import { Outlet } from "react-router-dom";

const LayoutGuru = () => {
  return (
    <div className="flex">
      <SidebarGuru />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutGuru;
