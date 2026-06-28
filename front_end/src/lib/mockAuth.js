export const MOCK_ADMIN_STORAGE_KEY = "einstein_mock_admin_user";

export const MOCK_ADMIN_USER = {
  id: "mock-admin",
  full_name: "A.A",
  email: "admin@example.com",
  role: "admin"
};

function readStoredUser() {
  try {
    const rawUser = localStorage.getItem(MOCK_ADMIN_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function getMockAdminUser() {
  const storedUser = readStoredUser();
  return storedUser?.role === "admin" ? storedUser : null;
}

export function hasMockAdminSession() {
  return Boolean(getMockAdminUser());
}

export function createMockAdminSession(email) {
  try {
    const user = {
      ...MOCK_ADMIN_USER,
      email: email || MOCK_ADMIN_USER.email
    };

    localStorage.setItem(MOCK_ADMIN_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem("einstein_lang", "de");
    localStorage.setItem("einstein_is_provider", "false");
    return user;
  } catch {
    return MOCK_ADMIN_USER;
  }
}

export function clearMockAdminSession() {
  try {
    localStorage.removeItem(MOCK_ADMIN_STORAGE_KEY);
    localStorage.removeItem("einstein_is_provider");
  } catch {
    // Local storage can be unavailable in private or locked-down contexts.
  }
}
