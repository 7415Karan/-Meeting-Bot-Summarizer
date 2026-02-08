// Use environment variable for production, fallback to localhost for dev
let BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

if (!BASE_URL.startsWith("http")) {
  BASE_URL = `https://${BASE_URL}`;
}


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
