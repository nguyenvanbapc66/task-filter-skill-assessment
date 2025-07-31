/**
 * User Activity Logger
 *
 * Service for logging user activities including login, logout, and other actions.
 * Stores logs in localStorage and provides methods for admin management.
 *
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

/**
 * Generate a mock IP address for demo purposes
 * In a real application, this would come from the server
 */
const generateMockIP = () => {
  const ips = [
    "192.168.1.100",
    "192.168.1.101",
    "192.168.1.102",
    "10.0.0.50",
    "172.16.0.25",
    "203.0.113.1",
    "198.51.100.1",
  ];
  return ips[Math.floor(Math.random() * ips.length)];
};

/**
 * Generate a mock JWT token for demo purposes
 * In a real application, this would be the actual JWT token
 */
const generateMockToken = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.";
  for (let i = 0; i < 50; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Get existing logs from localStorage
 */
const getLogs = () => {
  try {
    const storedLogs = localStorage.getItem("userLogs");
    return storedLogs ? JSON.parse(storedLogs) : [];
  } catch (error) {
    console.error("Error reading logs from localStorage:", error);
    return [];
  }
};

/**
 * Save logs to localStorage
 */
const saveLogs = (logs) => {
  try {
    localStorage.setItem("userLogs", JSON.stringify(logs));
  } catch (error) {
    console.error("Error saving logs to localStorage:", error);
  }
};

/**
 * Log user login activity
 *
 * @param {Object} userData - User information
 * @param {string} userData.email - User's email
 * @param {string} userData.role - User's role
 * @param {string} userData.userId - User's ID
 */
export const logUserLogin = (userData) => {
  const logs = getLogs();

  const logEntry = {
    id: Date.now().toString(),
    userId: userData.userId || `user-${Date.now()}`,
    username: userData.email,
    role: userData.role || "user",
    action: "login",
    loginTime: new Date().toISOString(),
    logoutTime: null,
    ipAddress: generateMockIP(),
    tokenName: generateMockToken(),
    sessionId: `session-${Date.now()}`,
  };

  logs.push(logEntry);
  saveLogs(logs);

  // Store session ID for logout tracking
  localStorage.setItem("currentSessionId", logEntry.sessionId);

  return logEntry;
};

/**
 * Log user logout activity
 *
 * @param {Object} userData - User information
 * @param {string} userData.email - User's email
 * @param {string} userData.role - User's role
 */
export const logUserLogout = (userData) => {
  const logs = getLogs();
  // const sessionId = localStorage.getItem("currentSessionId");

  // Find the most recent login entry for this user
  const loginEntry = logs
    .filter((log) => log.username === userData.email && log.action === "login" && !log.logoutTime)
    .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime))[0];

  if (loginEntry) {
    loginEntry.logoutTime = new Date().toISOString();
    loginEntry.action = "logout";
    saveLogs(logs);
  }

  // Clear session ID
  localStorage.removeItem("currentSessionId");
};

/**
 * Log user action (for future extensibility)
 *
 * @param {Object} userData - User information
 * @param {string} action - Action being performed
 * @param {Object} details - Additional details about the action
 */
export const logUserAction = (userData, action, details = {}) => {
  const logs = getLogs();

  const logEntry = {
    id: Date.now().toString(),
    userId: userData.userId || `user-${Date.now()}`,
    username: userData.email,
    role: userData.role || "user",
    action: action,
    loginTime: new Date().toISOString(),
    logoutTime: null,
    ipAddress: generateMockIP(),
    tokenName: generateMockToken(),
    details: details,
  };

  logs.push(logEntry);
  saveLogs(logs);
};

/**
 * Delete a log entry (admin function)
 *
 * @param {string} logId - ID of the log to delete
 * @returns {boolean} Success status
 */
export const deleteLog = (logId) => {
  try {
    const logs = getLogs();
    const updatedLogs = logs.filter((log) => log.id !== logId);
    saveLogs(updatedLogs);
    return true;
  } catch (error) {
    console.error("Error deleting log:", error);
    return false;
  }
};

/**
 * Get logs with optional filtering
 *
 * @param {Object} filters - Filter options
 * @param {string} filters.role - Filter by role
 * @param {string} filters.search - Search term
 * @param {string} filters.action - Filter by action
 * @returns {Array} Filtered logs
 */
export const getFilteredLogs = (filters = {}) => {
  let logs = getLogs();

  if (filters.role && filters.role !== "all") {
    logs = logs.filter((log) => log.role === filters.role);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    logs = logs.filter(
      (log) =>
        log.username.toLowerCase().includes(searchTerm) ||
        log.userId.toLowerCase().includes(searchTerm) ||
        (log.ipAddress && log.ipAddress.includes(searchTerm))
    );
  }

  if (filters.action) {
    logs = logs.filter((log) => log.action === filters.action);
  }

  return logs;
};

/**
 * Clear all logs (admin function)
 */
export const clearAllLogs = () => {
  try {
    localStorage.removeItem("userLogs");
    return true;
  } catch (error) {
    console.error("Error clearing logs:", error);
    return false;
  }
};
