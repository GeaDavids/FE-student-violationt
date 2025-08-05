// A collection of mock data that can be used as fallbacks when the API is unavailable
const mockData = {
  students: [
    { id: 101, nisn: "1234567890", user: { name: "Ahmad Rizky" }, classroom: { namaKelas: "XII IPA 1" } },
    { id: 102, nisn: "0987654321", user: { name: "Budi Santoso" }, classroom: { namaKelas: "XI IPS 2" } },
    { id: 103, nisn: "5678901234", user: { name: "Citra Dewi" }, classroom: { namaKelas: "X IPA 3" } },
    { id: 104, nisn: "4321098765", user: { name: "Diana Putri" }, classroom: { namaKelas: "XII IPS 1" } },
    { id: 105, nisn: "9876543210", user: { name: "Erik Gunawan" }, classroom: { namaKelas: "X IPA 2" } }
  ],
  
  violations: [
    { id: 201, nama: "Terlambat", kategori: "Kedisiplinan", point: 5 },
    { id: 202, nama: "Tidak mengerjakan tugas", kategori: "Akademik", point: 10 },
    { id: 203, nama: "Seragam tidak rapi", kategori: "Kerapian", point: 3 },
    { id: 204, nama: "Membolos", kategori: "Kedisiplinan", point: 15 },
    { id: 205, nama: "Berkelahi", kategori: "Perilaku", point: 25 }
  ],
  
  studentViolations: [
    {
      id: 1,
      tanggal: "2025-08-01",
      waktu: "2025-08-01T08:30:00",
      deskripsi: "Terlambat masuk kelas",
      evidenceUrl: null,
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
      tanggal: "2025-08-02",
      waktu: "2025-08-02T10:15:00",
      deskripsi: "Tidak mengerjakan PR",
      evidenceUrl: null,
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
      tanggal: "2025-08-03",
      waktu: "2025-08-03T13:00:00",
      deskripsi: "Berpakaian tidak rapi",
      evidenceUrl: null,
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
    }
  ]
};

/**
 * Utility function that attempts to fetch data from the API and falls back to mock data if the API call fails
 * @param {Function} apiCall - The API call function to execute
 * @param {String} mockDataKey - The key in the mockData object to use as fallback
 * @param {Function} onSuccess - Callback function to handle successful API response
 * @param {Function} onError - Callback function to handle API errors
 */
export const fetchWithFallback = async (apiCall, mockDataKey, onSuccess, onError) => {
  try {
    // Try to fetch data from the API
    const response = await apiCall();
    console.log(`Successfully fetched ${mockDataKey} from API:`, response.data);
    
    // Call the success callback with the API response data
    onSuccess(response.data);
  } catch (error) {
    // Log the error
    console.error(`Error fetching ${mockDataKey}:`, error);
    
    // Call the error callback if provided
    if (onError) {
      onError(error);
    }
    
    // Fall back to mock data
    console.warn(`Using mock ${mockDataKey} data due to API failure`);
    onSuccess(mockData[mockDataKey]);
  }
};

// Export the mock data for direct access if needed
export default mockData;
