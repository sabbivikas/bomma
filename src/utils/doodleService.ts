
import { Doodle, DoodleCreateInput } from '@/types/doodle';
import { v4 as uuidv4 } from 'uuid';

// Key for storing doodles in local storage
const DOODLES_STORAGE_KEY = 'make-something-wonderful-doodles';
const SESSION_ID_KEY = 'make-something-wonderful-session-id';

// Get session ID or generate a new one
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

// Get all doodles
export function getAllDoodles(): Doodle[] {
  const doodlesJson = localStorage.getItem(DOODLES_STORAGE_KEY);
  let doodles: Doodle[] = [];
  
  if (doodlesJson) {
    doodles = JSON.parse(doodlesJson);
  }
  
  // Always ensure we have sample doodles by generating them if needed
  if (doodles.length < 3) {
    doodles = generateSampleDoodles();
  }
  
  return doodles;
}

// Add a new doodle
export function createDoodle(input: DoodleCreateInput): Doodle {
  const doodles = getAllDoodles();
  
  const newDoodle: Doodle = {
    id: uuidv4(),
    imageUrl: input.imageUrl,
    prompt: input.prompt,
    sessionId: input.sessionId,
    createdAt: new Date().toISOString(),
    likes: 0
  };
  
  doodles.unshift(newDoodle); // Add to beginning of array
  localStorage.setItem(DOODLES_STORAGE_KEY, JSON.stringify(doodles));
  
  return newDoodle;
}

// Like a doodle
export function likeDoodle(id: string): Doodle | null {
  const doodles = getAllDoodles();
  const doodleIndex = doodles.findIndex(d => d.id === id);
  
  if (doodleIndex === -1) return null;
  
  doodles[doodleIndex].likes += 1;
  localStorage.setItem(DOODLES_STORAGE_KEY, JSON.stringify(doodles));
  
  return doodles[doodleIndex];
}

// Get doodles by session ID (user's doodles)
export function getMyDoodles(): Doodle[] {
  const sessionId = getSessionId();
  const doodles = getAllDoodles();
  
  return doodles.filter(doodle => doodle.sessionId === sessionId);
}

// Delete a doodle (only if it belongs to the current session)
export function deleteDoodle(id: string): boolean {
  const sessionId = getSessionId();
  const doodles = getAllDoodles();
  const doodleIndex = doodles.findIndex(d => d.id === id);
  
  if (doodleIndex === -1) return false;
  if (doodles[doodleIndex].sessionId !== sessionId) return false;
  
  doodles.splice(doodleIndex, 1);
  localStorage.setItem(DOODLES_STORAGE_KEY, JSON.stringify(doodles));
  
  return true;
}

// Generate sample doodles
export function generateSampleDoodles(): Doodle[] {
  // Clear existing doodles
  let doodles: Doodle[] = [];
  
  // Sample image URLs with more creative images
  const sampleImages = [
    'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?auto=format&fit=crop&w=500&h=500',
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=500&h=500',
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=500&h=500',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAEYklEQVR4Xu2dsW4UMRCG7QgUFCDRUFDwBDwAb8CTUNFQIAoKJCQKGlDScAUFBUjQQEMDEg+AxBtQ8QDU9Dnaz7o92bP2eG2v9+/O3mRn/v3H4/HOfbq4uDgn+jSVwCcCaYobDSMQYi4EAiHmEmAOh0qIOQSYwyEQYi4B5nCohJhDgDkcAiHmEmAOh0qIOQSYw1laCbvdbmdZptPT05HwLy8vR/cHg8Fo/Orqaj8yvs/P86Px8/PzfX+vvtvb2/24+0z3rwx1T/d0r9frfa7uM51j9b1/rPfs93q9wc99/e3Nzc3od/f39/tx5af7Oh/3uK/c+vylJbDkc5ZIyNSCdwt0ypT2k6LSuHveFpKgbPh+lUqII8U/EzmKlKWU4BK2hRIylRNKCXon51+SkDk2tUuKK0EKc+tV+0op4O3Ws01KjpRp5UwJIFDOFIYl+yqphGnl5EphqnTNIgUloDBV6iw5pOTIKdlrlsqZkoI0NMbIeXp6+kd+e3t7lGYfHx/3j91zut7c3Ix4HB4eju6rQ5DS00m77u7u9sed/PT9trb4qoM/rsb6+9XV1eh3h4eH++l6pWkPDg5GDVF9Ss4W00rTHjFbtiUVMvfLCle69LvKeT0rhleS9pazZTXkVEJspIRqz87O9smRZlLXqqDPVom7V70hx6BIcT1b+rltrWPO+54lfxB9qSpE/3X67+QLQvcq79NEKbi0EqKGnbZqoAqpZW2lw5e7yTS9lv/7Cqkp/VxCQo3X1ilr6j+B2LZVlZAUsGorJUJB1D+SlLXkwDXusZkKqZF01qrkXIW0ApUdAAFhR4jdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdX9ePlDwpI/ZHSpqUUfXNF0L3h9BWiTUt86kPeVQZoSP0NdBFExJqa03LSn6P8Q9b1rREsep3GBdNSKjjR+h+9K605h9FDo2H1sEOfTl0NR8AWTQhod1RQttxhCQXUss0Uv5BQtyN96J7Q7RE1/KWFVpLKBV6167iyxQCskhCcvam+xcNC1FN1/WswjZjXkaE7kXlLNz6+3vy1u1IWfszRosiBEXGlBmQ2M7mfHIXl8QJD0U3xSMu0tnc3/XS0/N/B19UCYmmfin2dvNCABBgEGIOAeZwCISYS4A5HCoh5hBgDodAiLkEmMMhEGIuAeZwqISYQ4A5HAIh5hJgDodAiLkEmMP5C+WTcgET0KHOAAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAD2ElEQVR4Xu2dMW4UQRCG7QAi5ISQAxDkJRABZ8gJgXMTYsJQuZdATJLAzSEBd+AMnIxEQEJIACLgDESImvWutF7P9vTurs301L91MjP/zD9fV1dXz+y9/X6/J/q0lcAnAtmWGx0jEGIuBAIh5hJgDodKiDkEmMMhEGIuAeZwqISYQ4A5HAIh5hJgDodKiDkEmMOZVQnb7XYnZTk5OfkjvouLi9G1i4uL0fXLy8vR9d1uN7pe3fP19XU0/vb2NrrmnnfHq2eqtbu7u/E47nPdderK+eXl5Wi8MVgqgZbPmQUhucluzf/UcSpDNf3qOTV+c3MzGq+TXs0nl7Uc37LAEggZs5xKKbkJnJpENzE1+W7yr66uRu+7uLgYvUdN7tTzYgnEigkJkZAKceopxn0+VgJGlbCrwhJQTEhW0yqQqVTlKqW+53chSW0XRq6tv7+/j56t5+t9nFuKS62V0rJqsVroHdWAFCey1tLb+VwV1VSbcgX9np+fj9Zo6pxKUNc1XSmNOYTW+8RC5FQrarFc2qnGcR/ivlcpQ+O7D7q+vh7NeafXj5XLqIS8JA+R4tRONSmlLF3TpLnvubeWqbb0aW5v5Mr5rvc04T6HiJTX19fR+3a73ehZum/rqUslOAVCUnFA3LSmxqte7o7nPn9vSrtrrRTprm+1a+OpdOuqZIxFSPvv1BO+VTuljFZ1NUZuilgEibNgL+0yoaW9clT1VGs45eA5a6ylcRIC2fRGQiA75CEhfAJZrgPBOWQd//jgdcgYIlRC+AVPJaQfEzmOVEK4jqESEpZAOocQCAnLIJWQfkz4OWIOPE59KiF+bVAJCdMFFaJyJTQO/n4Xkf7crwLJRUPKkZCQedUJJSEgVggJgWWUrIVICAiShIBAISFQCAmBQkiIX01DCYlhUoYIl0M4h4RLImwDJAQKISFQCAmBQkgIFEJCoJDc6b+EBGSCbYCEQCEkBAohIVAICYFCSAgUQkKgEBIChZAQKISEQCEkJMwj+G3ro2j4FRL+ww0ohIRAISSk/4zhHBImE84hYQ6hEsIveFJCREmYUKiE8AueSgg/Y0hImElICBRCQqAQEgKFkBAohIRAIbltX5UzuX3bqTqO8D1d0kBPl7DcHUwgRfeQkC4NEFJkG1TCLl3SQE+XNJAQIKTIIaiEXbqkgZ4uaSAhQEiRQ1AJu3RJAz1d0kBCgJAih6ASdumSBnq6pIGEACFFDkEl7NIlDfR0SQMJAUKKHMJMSDXJqiIup9Jj6n1z/lhFtd+bUPnzB0XwZv2QooDnuBQCIeZCIBBiLgHmcKiEmEOAORwCIeYSYA6HQIi5BJjDIRBiLgHmcKiEmEOAORwCIeYSYA7nNxGIN3A/RZkmAAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAFJUlEQVR4Xu2dQXITMRCGLQouHChO8ALgDXCjKrhRcOEGxSM4wAk4UMUbeAQ38AhA3oAbxQVOUMUrOFAc2PpVjtfarJSR1Jqx1PM7pZSxpdb/d/9SS9Zo9+nh4eEVfZpK4A2BNMWNhhEIMRcCgRBzCTCHQyXEHALM4RAIMZcAczgEQswlwBwOgRBzCTCHQyDEXALM4TCXcHx8bK6O7e3tTsfb29vdmpubm9oeN9/c3Oz22N3d7da4uVsw2LO6nrNnusedDw4OujW6Tp/pGl2jv6PX6jVuHrueeozFwlICUJ8zKyB9SfUlGGPnv+/xAJB8rAdQm+Pr4JAFsqRAvEdYAQqrgOTuZFfaetlz45JHTk9Pu2tgWWEvrMxdmwMy1FN+q0DOzs46y+sD4AjoWz/WOvxaOFdiS7KCvtu9AQT36d5e64GrxnohjMVcIwcQWJoHMre1jJ2fu/dPAjk4OOh6d47FJVlD97kU4qzG3YOvhcdZY0pVIT04S4y1tjFA3LVDk3z3+OvraxiEv0/3H/PcscfvUdBXVXVpqFarFZw9NYMw5B1jKcVZ/1j5ywkEYafrEB6Qmrxl+dTiUtZoQkL6QCitDKUX31PdZx8c5wlDlz4GE2BMpebeAMQqiFVtQnY91JN82uoDcnFxER7nPEaHi16r95RKf/5/gPDPcl6hz8d99b0aMmCMfUaJNTWAdMTDD7Rxj7MOd++YleieXAqFQRQCojfl7i/hifAKpDHc6/Nrtzjq5yGuoFB81mEL17v1SG3OOlDyolYA4n/fX/t/AWIJhUCu5x2TAvE9Fg8uWdFuLEvTVxz4HuvXoJ8BEJdygtYSvDZYO6Ywsebl7iEpqw+IszwEawXFpQ58DyzPgYD1+XsMpE98HiD+vm85CPMrBJKYrmgxJSaBQCAQQwkwh1JdR4/pIaW8Afc5iz0aO0o12h23NfQO7SVP3j5nD9Xrt2Ia6wUPIquc8TsUEAhEUSCpq6eWvB8CgUDUkr1iHdNuwUvIntZp1Gj0XnweMnfxq1R6YcoKbIVAIAoCtQTCOURxArUSQiW8PhxrISHsIWE6CluIgkC0oOxbxrvrWTAoI9JKQrQa7ashlMLYgjg7s9gGCAQmkEAgihPIWsrKfSfgLYyd7qsBpFb6al3hILCjoyN433MLCbGq8BzDi0CYsnQIATYhAiEQXVVQK5Xk0heDgrJtaSrKfL3mdAosfavrEUjYKxZ9gjF3zj4k2g3rXU1FySvnHW7NBx980B5i7kZUKZPxRGWFLaZJILomSyAEooOwrhvx1ZJ5Gwh7CIHIX60IhG0gTCFMWQoCtZKQnK1Xak/GmUpY7SHMy0aYsthDZIesDYiVA+u+vBDvfuiAyHiL/1HBRWXXqoCMWVWux/TBGvuZCP0N1J2l+ntQ9++Q8W+ipvyMxOzPKD2AZI+pVCMQt4hawhs7sI+elPzDir530EpA7u/vZ31XyRebmn5mXdUCQiAVAeHnXzXioZcxhbAPKUwadraaX6UvrNi/H9HQWl8w+BzMIHHKYsuKkGHKEiC0kBCmrAyhWskhwYH90C9dD/2kJPzYMe91apKQqt6H9J1q9pESQLxnICYfCcRfqKWA7OzsdKDcl5hT9WWJP3KW3O5+ktLvoOTu9qcgbJigXRGQFCivD0jfB0JKlq0x/6/mIQQS7gMEkkFKCwhTVgYprSREV2N1vXzMC55AbueoYOYhcp+oa48hkAxiWgGSA2LqlUFG2dXGgDBlFdRFFoXnFs8EUlAXWRRNIAV1kUXRBFJQF1kUTSAFdZFF0QRSUFVZFP0XnZScclGSQZ0AAAAASUVORK5CYII='
  ];
  
  const sessionId = getSessionId();
  const alternateSessionId = uuidv4(); // For "other users" doodles
  
  // Creative prompts for sample doodles
  const samplePrompts = [
    "A peaceful deer in the forest",
    "Vibrant flowers swaying in the wind",
    "Curious cat watching the world go by",
    "Abstract pattern with geometric shapes",
    "Sunset over rolling hills",
    "Cosmic stars forming a constellation",
    "Enchanted forest with magical creatures",
    "Ocean waves crashing on sandy shores"
  ];
  
  // Create 6 sample doodles
  for (let i = 0; i < 6; i++) {
    const newDoodle: Doodle = {
      id: uuidv4(),
      imageUrl: sampleImages[i % sampleImages.length],
      prompt: samplePrompts[i % samplePrompts.length],
      sessionId: i % 2 === 0 ? sessionId : alternateSessionId,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Spread out over days
      likes: Math.floor(Math.random() * 10)
    };
    doodles.push(newDoodle);
  }
  
  localStorage.setItem(DOODLES_STORAGE_KEY, JSON.stringify(doodles));
  return doodles;
}
