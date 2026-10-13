
const API_BASE_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  } catch {
    throw new Error(
      "Cannot connect to backend. Make sure node server.js is running on port 5000."
    );
  }

  const data = await response.json();

  if (!response.ok) {
    const details = data.result?.errors?.join(", ");
    throw new Error(details || data.message || "API request failed");
  }

  return data;
}

export function syncProduct(product) {
  return request("/sync/product", {
    method: "POST",
    body: JSON.stringify(product)
  });
}

export function getSyncHistory() {
  return request("/sync/history");
}

export function getSyncedProducts() {
  return request("/sync/products");
}
