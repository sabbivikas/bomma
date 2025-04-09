
import { v4 as uuidv4 } from 'uuid';

// Storage key for session ID
export const SESSION_ID_KEY = 'bomma_session_id';

// Get and set session ID (user's unique identifier stored in local storage)
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}
