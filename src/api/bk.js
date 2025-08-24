import axios from "./axios";
import API from "./api";

const bkAPI = {
  // Dashboard
  getClassroomStats: (tahunAjaranId) => {
    const params = tahunAjaranId ? { tahunAjaranId } : {};
    return API.get("/bk/classrooms", { params });
  },
  getStudentsInClassroom: (classroomId, tahunAjaranId) => {
    const params = tahunAjaranId ? { tahunAjaranId } : {};
    return API.get(`/bk/classrooms/${classroomId}/students`, { params });
  },
  getStudentDetail: (studentId, tahunAjaranId) => {
    const params = tahunAjaranId ? { tahunAjaranId } : {};
    return API.get(`/bk/students/${studentId}`, { params });
  },
  // Search students
  searchStudents: (query) => API.get("/bk/students", { params: { q: query } }),
};

export default bkAPI;
