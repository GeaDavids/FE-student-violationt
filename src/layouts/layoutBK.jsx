import SidebarBK from "../components/SidebarBK";
import { Outlet } from "react-router-dom";

const LayoutBK = () => {
  return (
    <div className="flex h-screen">
      <SidebarBK />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutBK;
