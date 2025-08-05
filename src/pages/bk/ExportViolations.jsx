import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { fetchWithFallback } from "../../utils/mockDataFallback";
import API from "../../api/api";
import { 
  FiDownload, 
  FiFilter, 
  FiCalendar, 
  FiSearch,
  FiRefreshCw,
  FiX,
  FiChevronDown
} from "react-icons/fi";
import * as XLSX from 'xlsx';

const ExportViolations = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    searchTerm: "",
    classId: "",
    violationTypeId: "",
  });
  
  const [classOptions, setClassOptions] = useState([]);
  const [violationOptions, setViolationOptions] = useState([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchViolationsData();
    fetchFilterOptions();
  }, []);
  
  // Fetch violations data
  const fetchViolationsData = async () => {
    setLoading(true);
    
    try {
      await fetchWithFallback(
        // API call function
        () => API.get("/api/student-violations"),
        
        // Mock data key
        "studentViolations",
        
        // Success callback
        (data) => {
          setViolations(data);
          setFilteredViolations(data);
        },
        
        // Error callback
        (error) => {
          console.error("Error fetching violations for export:", error);
          // Only show alert for non-connection errors
          if (error.response) {
            Swal.fire("Error!", "Gagal mengambil data pelanggaran siswa", "error");
          }
        }
      );
    } catch (err) {
      console.error("Unexpected error during violations fetch:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch filter options (classes and violation types)
  const fetchFilterOptions = async () => {
    try {
      // Fetch class options
      await fetchWithFallback(
        () => API.get("/api/classrooms"),
        "classrooms",
        (data) => setClassOptions(data),
        (error) => console.error("Error fetching classes:", error)
      );
      
      // Fetch violation type options
      await fetchWithFallback(
        () => API.get("/api/violations"),
        "violations",
        (data) => setViolationOptions(data),
        (error) => console.error("Error fetching violation types:", error)
      );
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply filters
  const applyFilters = () => {
    let result = [...violations];
    
    // Apply search term filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter(item => {
        const studentName = item.student?.user?.name?.toLowerCase() || '';
        const violationName = item.violation?.nama?.toLowerCase() || '';
        const className = item.student?.classroom?.namaKelas?.toLowerCase() || '';
        
        return studentName.includes(search) || 
               violationName.includes(search) || 
               className.includes(search);
      });
    }
    
    // Apply date range filter
    if (filters.startDate) {
      result = result.filter(item => 
        new Date(item.tanggal) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      result = result.filter(item => 
        new Date(item.tanggal) <= new Date(filters.endDate)
      );
    }
    
    // Apply class filter
    if (filters.classId) {
      result = result.filter(item => 
        item.student?.classroom?.id?.toString() === filters.classId
      );
    }
    
    // Apply violation type filter
    if (filters.violationTypeId) {
      result = result.filter(item => 
        item.violation?.id?.toString() === filters.violationTypeId
      );
    }
    
    setFilteredViolations(result);
    setFilterMenuOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      searchTerm: "",
      classId: "",
      violationTypeId: "",
    });
    setFilteredViolations(violations);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Export to Excel
  const exportToExcel = () => {
    setExporting(true);
    
    try {
      // Prepare data for export
      const exportData = filteredViolations.map(item => ({
        'Nama Siswa': item.student?.user?.name || '-',
        'NISN': item.student?.nisn || '-',
        'Kelas': item.student?.classroom?.namaKelas || '-',
        'Pelanggaran': item.violation?.nama || '-',
        'Kategori': item.violation?.kategori || '-',
        'Point': item.violation?.point || 0,
        'Tanggal': formatDate(item.tanggal),
        'Keterangan': item.deskripsi || '-'
      }));
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-fit column widths
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(item => item[key] ? item[key].toString().length : 0)
        )
      }));
      ws['!cols'] = colWidths;
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Pelanggaran Siswa");
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const fileName = `Laporan_Pelanggaran_Siswa_${dateStr}.xlsx`;
      
      // Export file
      XLSX.writeFile(wb, fileName);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Data berhasil diekspor ke file ${fileName}`,
      });
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Ekspor Data',
        text: 'Terjadi kesalahan saat mengekspor data.',
      });
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366] mb-1">
            Ekspor Data Pelanggaran
          </h2>
          <p className="text-gray-500">
            Ekspor data pelanggaran siswa ke format Excel untuk analisis lebih lanjut.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded flex items-center gap-2 shadow-sm transition"
          >
            <FiFilter /> Filter <FiChevronDown className={`transition ${filterMenuOpen ? 'transform rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={exportToExcel}
            disabled={exporting || filteredViolations.length === 0}
            className={`bg-[#003366] hover:bg-[#002244] transition text-white px-6 py-2 rounded flex items-center gap-2 shadow ${
              exporting || filteredViolations.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {exporting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                <span>Mengekspor...</span>
              </>
            ) : (
              <>
                <FiDownload /> Ekspor ke Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterMenuOpen && (
        <div className="bg-white shadow-md rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select
                name="classId"
                value={filters.classId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              >
                <option value="">Semua Kelas</option>
                {classOptions.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.namaKelas}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pelanggaran</label>
              <select
                name="violationTypeId"
                value={filters.violationTypeId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              >
                <option value="">Semua Jenis</option>
                {violationOptions.map(viol => (
                  <option key={viol.id} value={viol.id}>
                    {viol.nama}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="Cari siswa/pelanggaran..."
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 flex items-center gap-1"
            >
              <FiRefreshCw size={14} /> Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-[#003366] text-white rounded hover:bg-[#002244]"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      )}

      {/* Quick Search outside filter panel */}
      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange({target: {name: 'searchTerm', value: e.target.value}})}
          onKeyUp={(e) => e.key === 'Enter' && applyFilters()}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-transparent"
          placeholder="Cari cepat..."
        />
        {filters.searchTerm && (
          <button
            onClick={() => {
              setFilters(prev => ({...prev, searchTerm: ""}));
              applyFilters();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <FiX className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siswa
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelanggaran
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Poin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredViolations.length > 0 ? (
                    filteredViolations.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{item.student?.user?.name || '-'}</div>
                          <div className="text-xs text-gray-500">{item.student?.nisn || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.student?.classroom?.namaKelas || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.violation?.nama || '-'}</div>
                          <div className="text-xs text-gray-500">{item.violation?.kategori || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                          <span className="bg-red-100 text-red-800 font-semibold px-2.5 py-0.5 rounded-full">
                            {item.violation?.point || 0}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        {filters.searchTerm || filters.startDate || filters.endDate || filters.classId || filters.violationTypeId ? 
                          "Tidak ada data yang sesuai dengan filter" : 
                          "Belum ada data pelanggaran siswa"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-gray-500 text-sm">
            <div>
              Total data: <span className="font-semibold">{filteredViolations.length}</span> dari <span className="font-semibold">{violations.length}</span> pelanggaran
            </div>
            
            {filteredViolations.length > 0 && (
              <button 
                onClick={exportToExcel}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                disabled={exporting}
              >
                {exporting ? 
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></span> :
                  <FiDownload size={14} />
                }
                {exporting ? "Mengekspor..." : "Ekspor Data Ini"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportViolations;
