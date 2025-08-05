import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/api";
import { fetchWithFallback } from "../../utils/mockDataFallback";
import { 
  FiAlertCircle, 
  FiUsers, 
  FiTrendingUp, 
  FiCalendar, 
  FiFileText,
  FiBarChart2,
  FiArrowRight,
  FiUserCheck,
  FiCheckCircle,
  FiAward
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardBK = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalViolations: 0,
    totalStudents: 0,
    violationsThisMonth: 0,
    recentViolations: [],
    topViolationTypes: [],
    violationsByClass: [],
    violationTrends: []
  });

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) setUserName(name);
    
    const storedRole = localStorage.getItem("role");
    if (!storedRole) navigate("/");
    
    fetchDashboardData();
  }, [navigate]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      // In production, this would call a dedicated dashboard endpoint
      console.log("Fetching dashboard data...");
      
      // 1. Fetch all violations to calculate stats
      await fetchWithFallback(
        // API call function
        () => API.get("/api/student-violations"),
        
        // Mock data key
        "studentViolations",
        
        // Success callback
        (violations) => {
          // 2. Fetch students to calculate stats
          fetchWithFallback(
            () => API.get("/api/users/students"),
            "students",
            (students) => {
              // Process dashboard data
              processDashboardData(violations, students);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching students:", error);
              // Use mock data for processing in development
              if (import.meta.env.DEV) {
                const mockStudents = getMockStudents();
                processDashboardData(violations, mockStudents);
              }
              setLoading(false);
            }
          );
        },
        
        // Error callback
        (error) => {
          console.error("Error fetching violations:", error);
          // Use mock data for processing in development
          if (import.meta.env.DEV) {
            const mockViolations = getMockViolations();
            const mockStudents = getMockStudents();
            processDashboardData(mockViolations, mockStudents);
          }
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error in dashboard data fetch:", err);
      setLoading(false);
      
      // Use mock data in development mode or if API fails
      if (import.meta.env.DEV) {
        const mockViolations = getMockViolations();
        const mockStudents = getMockStudents();
        processDashboardData(mockViolations, mockStudents);
      }
    }
  };
  
  // Function to process violation and student data into dashboard metrics
  const processDashboardData = (violations, students) => {
    // Calculate total violations
    const totalViolations = violations.length;
    
    // Calculate total students with violations
    const studentsWithViolations = [...new Set(violations.map(v => v.student?.id))].length;
    
    // Calculate violations this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const violationsThisMonth = violations.filter(v => {
      const violationDate = new Date(v.tanggal);
      return violationDate.getMonth() === currentMonth && violationDate.getFullYear() === currentYear;
    }).length;
    
    // Get recent violations (last 5)
    const recentViolations = [...violations]
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      .slice(0, 5);
    
    // Calculate top violation types
    const violationTypes = {};
    violations.forEach(v => {
      const type = v.violation?.nama || "Lainnya";
      if (!violationTypes[type]) violationTypes[type] = 0;
      violationTypes[type]++;
    });
    
    const topViolationTypes = Object.entries(violationTypes)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate violations by class
    const violationsByClass = {};
    violations.forEach(v => {
      const className = v.student?.classroom?.namaKelas || "Tidak Ada Kelas";
      if (!violationsByClass[className]) violationsByClass[className] = 0;
      violationsByClass[className]++;
    });
    
    const violationsByClassArray = Object.entries(violationsByClass)
      .map(([className, count]) => ({ className, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate violation trends (last 6 months)
    const violationTrends = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      const count = violations.filter(v => {
        const violationDate = new Date(v.tanggal);
        return violationDate.getMonth() === month.getMonth() && 
               violationDate.getFullYear() === month.getFullYear();
      }).length;
      
      violationTrends.push({
        month: monthName,
        count
      });
    }
    
    setDashboardData({
      totalViolations,
      totalStudents: studentsWithViolations,
      violationsThisMonth,
      recentViolations,
      topViolationTypes,
      violationsByClass: violationsByClassArray,
      violationTrends
    });
  };
  
  // Mock data generators for development
  const getMockViolations = () => {
    return [
      {
        id: 1,
        tanggal: "2023-08-15",
        student: {
          id: 101,
          nisn: "1234567890",
          user: { name: "Ahmad Rizky" },
          classroom: { namaKelas: "XII IPA 1" }
        },
        violation: {
          id: 201,
          nama: "Terlambat",
          kategori: "Kedisiplinan",
          point: 5
        }
      },
      {
        id: 2,
        tanggal: "2023-08-10",
        student: {
          id: 102,
          nisn: "0987654321",
          user: { name: "Budi Santoso" },
          classroom: { namaKelas: "XI IPS 2" }
        },
        violation: {
          id: 202,
          nama: "Tidak mengerjakan tugas",
          kategori: "Akademik",
          point: 10
        }
      },
      {
        id: 3,
        tanggal: "2023-07-20",
        student: {
          id: 103,
          nisn: "5678901234",
          user: { name: "Citra Dewi" },
          classroom: { namaKelas: "X IPA 3" }
        },
        violation: {
          id: 203,
          nama: "Seragam tidak rapi",
          kategori: "Kerapian",
          point: 3
        }
      },
      // More mock data
      {
        id: 4,
        tanggal: "2023-07-15",
        student: {
          id: 104,
          nisn: "6543217890",
          user: { name: "Dodi Pratama" },
          classroom: { namaKelas: "XII IPA 1" }
        },
        violation: {
          id: 201,
          nama: "Terlambat",
          kategori: "Kedisiplinan",
          point: 5
        }
      },
      {
        id: 5,
        tanggal: "2023-06-05",
        student: {
          id: 105,
          nisn: "9876543210",
          user: { name: "Eka Putri" },
          classroom: { namaKelas: "XI IPS 1" }
        },
        violation: {
          id: 204,
          nama: "Menggunakan HP saat pelajaran",
          kategori: "Kedisiplinan",
          point: 15
        }
      }
    ];
  };
  
  const getMockStudents = () => {
    return [
      {
        id: 101,
        nisn: "1234567890",
        user: { name: "Ahmad Rizky" },
        classroom: { namaKelas: "XII IPA 1" }
      },
      {
        id: 102,
        nisn: "0987654321",
        user: { name: "Budi Santoso" },
        classroom: { namaKelas: "XI IPS 2" }
      },
      {
        id: 103,
        nisn: "5678901234",
        user: { name: "Citra Dewi" },
        classroom: { namaKelas: "X IPA 3" }
      },
      {
        id: 104,
        nisn: "6543217890",
        user: { name: "Dodi Pratama" },
        classroom: { namaKelas: "XII IPA 1" }
      },
      {
        id: 105,
        nisn: "9876543210",
        user: { name: "Eka Putri" },
        classroom: { namaKelas: "XI IPS 1" }
      }
    ];
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#003366] mb-2">
          Dashboard BK
        </h1>
        <p className="text-gray-500">
          Selamat datang, <span className="font-medium">{userName || "BK"}</span>. Berikut ringkasan data pelanggaran siswa.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
          <p className="mt-4 text-gray-500">Memuat data dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Violations Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <FiAlertCircle className="text-red-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Total Pelanggaran</h3>
                  <p className="text-2xl font-bold text-gray-800">{dashboardData.totalViolations}</p>
                </div>
              </div>
            </div>

            {/* Students with Violations Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <FiUsers className="text-blue-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Siswa dengan Pelanggaran</h3>
                  <p className="text-2xl font-bold text-gray-800">{dashboardData.totalStudents}</p>
                </div>
              </div>
            </div>

            {/* Monthly Violations Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <FiCalendar className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Bulan Ini</h3>
                  <p className="text-2xl font-bold text-gray-800">{dashboardData.violationsThisMonth}</p>
                </div>
              </div>
            </div>

            {/* Quick Link to Add New Card */}
            <div className="bg-[#003366] rounded-lg shadow-md p-5 text-white flex flex-col justify-between">
              <h3 className="text-white text-sm font-medium mb-2">Catat Pelanggaran Baru</h3>
              <Link 
                to="/bk/add-violation"
                className="flex items-center justify-between mt-2 bg-white/10 hover:bg-white/20 rounded-md px-3 py-2 text-sm font-medium"
              >
                <span>Tambah Data</span>
                <FiArrowRight />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Violation Types Chart */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 col-span-1">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Jenis Pelanggaran</h3>
              <div className="h-64">
                {dashboardData.topViolationTypes.length > 0 ? (
                  <Doughnut 
                    data={{
                      labels: dashboardData.topViolationTypes.map(v => v.name),
                      datasets: [
                        {
                          data: dashboardData.topViolationTypes.map(v => v.count),
                          backgroundColor: [
                            '#3b82f6', // blue
                            '#ef4444', // red
                            '#10b981', // green
                            '#f59e0b', // amber
                            '#6366f1', // indigo
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Tidak ada data
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Trends Chart */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 col-span-1 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Tren Pelanggaran (6 Bulan Terakhir)</h3>
              <div className="h-64">
                {dashboardData.violationTrends.length > 0 ? (
                  <Line
                    data={{
                      labels: dashboardData.violationTrends.map(t => t.month),
                      datasets: [
                        {
                          label: 'Jumlah Pelanggaran',
                          data: dashboardData.violationTrends.map(t => t.count),
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Tidak ada data
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Data Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Violations Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Pelanggaran Terbaru</h3>
                <Link 
                  to="/bk/student-violations"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <FiArrowRight size={14} />
                </Link>
              </div>
              
              {dashboardData.recentViolations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Siswa</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Pelanggaran</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentViolations.map((v, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <div className="font-medium">{v.student?.user?.name || "-"}</div>
                            <div className="text-xs text-gray-500">{v.student?.classroom?.namaKelas || "-"}</div>
                          </td>
                          <td className="px-3 py-3">{v.violation?.nama || "-"}</td>
                          <td className="px-3 py-3">{new Date(v.tanggal).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-gray-500">
                  Belum ada data pelanggaran
                </div>
              )}
            </div>

            {/* Violations by Class Chart */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Pelanggaran Berdasarkan Kelas</h3>
              
              <div className="h-72">
                {dashboardData.violationsByClass.length > 0 ? (
                  <Bar
                    data={{
                      labels: dashboardData.violationsByClass.slice(0, 6).map(v => v.className),
                      datasets: [
                        {
                          label: 'Jumlah Pelanggaran',
                          data: dashboardData.violationsByClass.slice(0, 6).map(v => v.count),
                          backgroundColor: '#3b82f6',
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Tidak ada data
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardBK;
