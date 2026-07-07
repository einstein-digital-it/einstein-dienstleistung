export function getStoredAuthUser() {
  try {
    const rawUser = localStorage.getItem("einstein_auth_user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function getStoredEmail() {
  return getStoredAuthUser()?.email || localStorage.getItem("einstein_customer_email") || "";
}

export function redirectToLogin() {
  window.location.href = "/Login";
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem("einstein_auth_user");
    localStorage.removeItem("einstein_auth_token");
    localStorage.removeItem("einstein_is_provider");
  } catch {
    // Ignore unavailable localStorage.
  }
}

export function requireStoredUser({ role, redirect = true } = {}) {
  const user = getStoredAuthUser();

  if (!user?.email) {
    if (redirect) redirectToLogin();
    return null;
  }

  if (role && user.role !== role) {
    if (redirect) window.location.href = "/";
    return null;
  }

  if (user.email) {
    localStorage.setItem("einstein_customer_email", user.email);
  }

  return user;
}
