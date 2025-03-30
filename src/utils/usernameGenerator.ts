
/**
 * Username generator utility
 * Generates fun, random usernames for comments
 */

// Arrays of adjectives and nouns for username generation
const adjectives = [
  "Happy", "Sleepy", "Grumpy", "Sneaky", "Creative", 
  "Curious", "Brave", "Clever", "Playful", "Dreamy",
  "Magical", "Silly", "Friendly", "Fluffy", "Sparkly",
  "Wild", "Mellow", "Jolly", "Funky", "Dazzling"
];

const nouns = [
  "Panda", "Dragon", "Unicorn", "Artist", "Wizard", 
  "Cat", "Fox", "Robot", "Tiger", "Penguin",
  "Pirate", "Ninja", "Astronaut", "Dino", "Monkey",
  "Raccoon", "Owl", "Koala", "Squirrel", "Wolf"
];

/**
 * Generates a random username in the format "AdjectiveNoun123"
 * @returns A randomly generated username
 */
export const generateRandomUsername = (): string => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

/**
 * Gets a consistent username for a session ID
 * @param sessionId The session ID to generate a username for
 * @returns A username that's consistent for the given session ID
 */
export const getUsernameForSession = (sessionId: string): string => {
  // Use the first character of the session ID to determine adjective index
  const adjIndex = parseInt(sessionId.charAt(0), 16) % adjectives.length;
  // Use the last character of the session ID to determine noun index
  const nounIndex = parseInt(sessionId.charAt(sessionId.length - 1), 16) % nouns.length;
  // Use middle characters for the number
  const midChar = sessionId.charAt(Math.floor(sessionId.length / 2));
  const midChar2 = sessionId.charAt(Math.floor(sessionId.length / 2) + 1);
  const number = parseInt(`${midChar}${midChar2}`, 16) % 100;
  
  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
};
