
import { v4 as uuidv4 } from 'uuid';

// Storage key for session ID
export const SESSION_ID_KEY = 'bomma_session_id';

// Get and set session ID (user's unique identifier stored in local storage)
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    console.log("Created new session ID:", sessionId);
  } else {
    console.log("Using existing session ID:", sessionId);
  }
  return sessionId;
}

// Ensure session ID is properly initialized on page load
export function initializeSessionId(): string {
  return getSessionId();
}

// Clear session ID (for testing purposes)
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
  console.log("Session ID cleared");
}
