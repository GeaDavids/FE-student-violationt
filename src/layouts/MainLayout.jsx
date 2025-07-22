import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ModalKelolaUser from "../components/ModalKelolaUser";

const Layout = ({ children }) => {
  const [kelolaUserTarget, setKelolaUserTarget] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onKelolaUserClick={(target) => setKelolaUserTarget(target)} />
      
      {/* Konten utama */}
      <div className="flex-1 overflow-y-auto bg-gray-50">{children}</div>

      {/* Modal Kelola User */}
      {kelolaUserTarget && (
        <ModalKelolaUser
          type={kelolaUserTarget}
          onClose={() => setKelolaUserTarget(null)}
        />
      )}
    </div>
  );
};

export default Layout;
