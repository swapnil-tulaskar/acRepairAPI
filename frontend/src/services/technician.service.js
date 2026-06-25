import api from "./api";

export const getJobs = () => {
  return api.get("/technician/jobs");
};

export const updateJobStatus = (id, status) => {
  return api.patch(`/technician/jobs/${id}/status`, { status });
};
