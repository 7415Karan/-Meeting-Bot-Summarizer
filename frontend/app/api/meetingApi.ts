// const BASE_URL = "http://127.0.0.1:8000";

// Use environment variable for production, fallback to localhost for dev
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


export async function createMeeting(formData: FormData) {
  const res = await fetch(`${BASE_URL}/meeting/create`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function getMeetings() {
  const res = await fetch(`${BASE_URL}/meetings`);
  return res.json();
}

export async function deleteMeeting(id: number) {
  return fetch(`${BASE_URL}/meetings/${id}`, { method: "DELETE" });
}
