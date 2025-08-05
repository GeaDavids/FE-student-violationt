import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import { fetchWithFallback } from "../../utils/mockDataFallback";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave } from "react-icons/fi";

const CategoryViolation = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    id: null,
    nama: "",
    deskripsi: ""
  });

  // Fetch categories data
  const fetchCategories = async () => {
    setLoading(true);
    console.log("Fetching violation categories...");
    
    try {
      await fetchWithFallback(
        // API call function - adjust this to match your API endpoint structure
        () => API.get("/api/violation-categories"),
        
        // Mock data key
        "violationCategories",
        
        // Success callback
        (data) => {
          setCategories(data);
          setFiltered(data);
        },
        
        // Error callback
        (error) => {
          console.error("Error fetching violation categories:", error);
          // Only show alert for non-connection errors
          if (error.response) {
            Swal.fire("Error!", "Gagal mengambil data kategori pelanggaran", "error");
          }
          
          // Use mock data in development mode
          if (import.meta.env.DEV) {
            const mockData = getMockCategories();
            setCategories(mockData);
            setFiltered(mockData);
          }
        }
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      
      // Use mock data in development mode
      if (import.meta.env.DEV) {
        const mockData = getMockCategories();
        setCategories(mockData);
        setFiltered(mockData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data generator
  const getMockCategories = () => {
    return [
      { id: 1, nama: "Kedisiplinan", deskripsi: "Pelanggaran terkait kedisiplinan siswa seperti terlambat atau bolos" },
      { id: 2, nama: "Akademik", deskripsi: "Pelanggaran terkait tugas dan kewajiban akademik" },
      { id: 3, nama: "Kerapian", deskripsi: "Pelanggaran terkait kerapian seragam dan penampilan" },
      { id: 4, nama: "Perilaku", deskripsi: "Pelanggaran terkait perilaku dan sikap siswa" },
      { id: 5, nama: "Sosial", deskripsi: "Pelanggaran terkait interaksi sosial dan hubungan antar siswa" }
    ];
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value) {
      const result = categories.filter(
        (category) => 
          category.nama.toLowerCase().includes(value) ||
          (category.deskripsi && category.deskripsi.toLowerCase().includes(value))
      );
      setFiltered(result);
    } else {
      setFiltered(categories);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    setFiltered(categories);
  };

  const openModal = (category = null) => {
    if (category) {
      setCurrentCategory({ ...category });
      setIsEditing(true);
    } else {
      setCurrentCategory({ id: null, nama: "", deskripsi: "" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory({ id: null, nama: "", deskripsi: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({ ...currentCategory, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!currentCategory.nama.trim()) {
      Swal.fire("Error", "Nama kategori tidak boleh kosong", "error");
      return;
    }
    
    try {
      // Create or update the category
      if (isEditing) {
        // Update existing category
        console.log(`Updating category ID ${currentCategory.id}`);
        await API.put(`/api/violation-categories/${currentCategory.id}`, currentCategory);
        
        // Update local state
        const updatedCategories = categories.map(cat => 
          cat.id === currentCategory.id ? currentCategory : cat
        );
        setCategories(updatedCategories);
        setFiltered(handleSearchFilter(updatedCategories, searchTerm));
        
        Swal.fire("Berhasil!", "Kategori pelanggaran berhasil diperbarui", "success");
      } else {
        // Create new category
        console.log("Creating new violation category");
        const response = await API.post("/api/violation-categories", currentCategory);
        
        // Update local state with the new category from response
        const newCategory = response.data || { ...currentCategory, id: Date.now() }; // Fallback ID if response doesn't include it
        const updatedCategories = [...categories, newCategory];
        setCategories(updatedCategories);
        setFiltered(handleSearchFilter(updatedCategories, searchTerm));
        
        Swal.fire("Berhasil!", "Kategori pelanggaran berhasil ditambahkan", "success");
      }
      
      // Close modal and reset form
      closeModal();
    } catch (err) {
      console.error("Error saving category:", err);
      
      // In development mode, simulate success
      if (import.meta.env.DEV) {
        // Create a mock response
        if (isEditing) {
          // Update existing category in mock data
          const updatedCategories = categories.map(cat => 
            cat.id === currentCategory.id ? currentCategory : cat
          );
          setCategories(updatedCategories);
          setFiltered(handleSearchFilter(updatedCategories, searchTerm));
          
          Swal.fire("Berhasil (Mode Simulasi)!", "Kategori pelanggaran berhasil diperbarui", "success");
        } else {
          // Create new category in mock data
          const newCategory = { ...currentCategory, id: Date.now() };
          const updatedCategories = [...categories, newCategory];
          setCategories(updatedCategories);
          setFiltered(handleSearchFilter(updatedCategories, searchTerm));
          
          Swal.fire("Berhasil (Mode Simulasi)!", "Kategori pelanggaran berhasil ditambahkan", "success");
        }
        
        // Close modal and reset form
        closeModal();
      } else {
        // Show error message in production
        Swal.fire("Error", "Gagal menyimpan data kategori", "error");
      }
    }
  };

  const handleSearchFilter = (categoryList, term) => {
    if (!term) return categoryList;
    
    return categoryList.filter(
      (category) => 
        category.nama.toLowerCase().includes(term.toLowerCase()) ||
        (category.deskripsi && category.deskripsi.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Kategori yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(`Deleting category with ID: ${id}`);
          await API.delete(`/api/violation-categories/${id}`);
          
          // Update local state
          const updatedCategories = categories.filter(category => category.id !== id);
          setCategories(updatedCategories);
          setFiltered(handleSearchFilter(updatedCategories, searchTerm));
          
          Swal.fire("Terhapus!", "Kategori pelanggaran berhasil dihapus.", "success");
        } catch (err) {
          console.error("Error deleting category:", err);
          
          // In development mode, simulate success
          if (import.meta.env.DEV) {
            // Delete from mock data
            const updatedCategories = categories.filter(category => category.id !== id);
            setCategories(updatedCategories);
            setFiltered(handleSearchFilter(updatedCategories, searchTerm));
            
            Swal.fire("Terhapus (Mode Simulasi)!", "Kategori pelanggaran berhasil dihapus.", "success");
          } else {
            // Show error message in production
            Swal.fire("Error", "Gagal menghapus kategori", "error");
          }
        }
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366] mb-1">
            Kelola Kategori Pelanggaran
          </h2>
          <p className="text-gray-500">
            Kelola kategori-kategori pelanggaran yang digunakan dalam sistem.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-2 rounded flex items-center gap-2 shadow transition"
        >
          <FiPlus /> Tambah Kategori
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            placeholder="Cari kategori pelanggaran..."
          />
          {searchTerm && (
            <button
              onClick={resetSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <FiX className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{category.nama}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{category.deskripsi || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FiEdit2 className="inline" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm
                  ? "Tidak ada kategori yang sesuai dengan pencarian"
                  : "Belum ada data kategori pelanggaran"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal for add/edit category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <FiX className="text-xl" />
            </button>
            
            <h3 className="text-xl font-semibold text-[#003366] mb-4">
              {isEditing ? "Edit Kategori Pelanggaran" : "Tambah Kategori Pelanggaran Baru"}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={currentCategory.nama}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="Masukkan nama kategori"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={currentCategory.deskripsi}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="Masukkan deskripsi kategori"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-md flex items-center gap-2"
                >
                  <FiSave /> {isEditing ? "Simpan Perubahan" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryViolation;
