// Utility to get current user from localStorage (assuming backend returns user info on login)
export function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    return JSON.parse(user);
  } catch {
    return null;
  }
}
