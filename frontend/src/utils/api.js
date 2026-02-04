// API utility functions with authentication headers

export const apiRequest = async (url, options = {}) => {
  const userId = localStorage.getItem("userId");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (userId) {
    headers["x-user-id"] = userId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Request failed");
    } else {
      // Response is not JSON (probably HTML)
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 200));
      throw new Error(`Server error: ${response.status} - Expected JSON but received ${contentType || 'unknown content type'}`);
    }
  }

  // Check if response is JSON before parsing
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    const text = await response.text();
    console.error("Non-JSON success response:", text.substring(0, 200));
    throw new Error("Expected JSON response but received " + (contentType || 'unknown content type'));
  }
};
