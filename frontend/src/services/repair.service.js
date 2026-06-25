import api from "./api";

export const createRepair = (data) => {
  return api.post("/repair", data);
};

export const getMyRepairs = () => {
  return api.get("/repair/my");
};

export const deleteRepair = (id) => {
  return api.delete(`/repair/${id}`);
};
