import API from "./api";

// Get all classrooms
export const getAllClassrooms = async () => {
  try {
    const response = await API.get("/bk/classrooms");
    return response.data;
  } catch (error) {
    throw error;
  }
};
