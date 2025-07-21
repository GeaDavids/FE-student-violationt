import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ModalKelolaUser from "../components/ModalKelolaUser";

const Layout = ({ children }) => {
  const [kelolaUserTarget, setKelolaUserTarget] = useState(null);

  return (
    <div className="flex">
      <Sidebar onKelolaUserClick={(target) => setKelolaUserTarget(target)} />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        {children}
      </div>

    </div>
  );
};

export default Layout;
