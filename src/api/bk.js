import axios from "./axios";

const bkAPI = {
  // Dashboard
  getClassroomStats: (tahunAjaranId) => {
    const params = tahunAjaranId ? { tahunAjaranId } : {};
    return axios.get("/bk/classrooms", { params });
  },
  getStudentsInClassroom: (classroomId, tahunAjaranId) => {
    const params = tahunAjaranId ? { tahunAjaranId } : {};
    return axios.get(`/bk/classrooms/${classroomId}/students`, { params });
  },
  getStudentDetail: (studentId, tahunAjaranId) => {
    const params = tahunAjaranId ? { tahunAjaranId } : {};
    return axios.get(`/bk/students/${studentId}`, { params });
  },
  // Search students
  searchStudents: (query) =>
    axios.get("/bk/students", { params: { q: query } }),
};

export default bkAPI;
