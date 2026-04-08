const API = {
  gateway: "http://127.0.0.1:4000",
  auth: "http://127.0.0.1:4100",
  booking: "http://127.0.0.1:4200",
  payment: "http://127.0.0.1:4300",
  dispatch: "http://127.0.0.1:4400",
  rewards: "http://127.0.0.1:4500",
  marketplace: "http://127.0.0.1:4600",
  driver: "http://127.0.0.1:4700",
  admin: "http://127.0.0.1:4800"
};

function saveToken(token) {
  localStorage.setItem("aam_token", token);
}
function getToken() {
  return localStorage.getItem("aam_token") || "";
}
function clearToken() {
  localStorage.removeItem("aam_token");
}
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {})
    },
    ...options
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, status: res.status };
  }
}
function show(id, data) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  }
}
