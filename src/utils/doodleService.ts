
import { Doodle, DoodleCreateInput, Comment } from '@/types/doodle';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Key for storing session ID in local storage
const SESSION_ID_KEY = 'make-something-wonderful-session-id';

// Custom event for doodle publishing
const publishEvent = new Event('doodle-published');

// Get session ID or generate a new one
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

// Get all doodles from Supabase
export async function getAllDoodles(): Promise<Doodle[]> {
  const { data, error } = await supabase
    .from('doodles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching doodles:', error);
    return [];
  }
  
  // Convert the data to match our Doodle type
  return data.map(item => ({
    id: item.id,
    imageUrl: item.image_url,
    prompt: item.prompt,
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes
  }));
}

// Add a new doodle to Supabase
export async function createDoodle(input: DoodleCreateInput): Promise<Doodle | null> {
  const newDoodle = {
    image_url: input.imageUrl,
    prompt: input.prompt,
    session_id: input.sessionId,
    likes: 0
  };
  
  const { data, error } = await supabase
    .from('doodles')
    .insert(newDoodle)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating doodle:', error);
    return null;
  }
  
  // Dispatch event to notify other components that a doodle was published
  window.dispatchEvent(publishEvent);
  
  // Convert to our Doodle type
  return {
    id: data.id,
    imageUrl: data.image_url,
    prompt: data.prompt,
    sessionId: data.session_id,
    createdAt: data.created_at,
    likes: data.likes
  };
}

// Like a doodle
export async function likeDoodle(id: string): Promise<Doodle | null> {
  // First get the current doodle to increment likes
  const { data: currentDoodle, error: fetchError } = await supabase
    .from('doodles')
    .select('likes')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    console.error('Error fetching doodle for like:', fetchError);
    return null;
  }
  
  const updatedLikes = (currentDoodle.likes || 0) + 1;
  
  // Update the likes count
  const { data, error } = await supabase
    .from('doodles')
    .update({ likes: updatedLikes })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating doodle likes:', error);
    return null;
  }
  
  // Convert to our Doodle type
  return {
    id: data.id,
    imageUrl: data.image_url,
    prompt: data.prompt,
    sessionId: data.session_id,
    createdAt: data.created_at,
    likes: data.likes
  };
}

// Get doodles by session ID (user's doodles)
export async function getMyDoodles(): Promise<Doodle[]> {
  const sessionId = getSessionId();
  
  const { data, error } = await supabase
    .from('doodles')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching my doodles:', error);
    return [];
  }
  
  // Convert the data to match our Doodle type
  return data.map(item => ({
    id: item.id,
    imageUrl: item.image_url,
    prompt: item.prompt,
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes
  }));
}

// Delete a doodle (only if it belongs to the current session)
export async function deleteDoodle(id: string): Promise<boolean> {
  const sessionId = getSessionId();
  
  // First check if doodle belongs to current session
  const { data: doodleData, error: checkError } = await supabase
    .from('doodles')
    .select('session_id')
    .eq('id', id)
    .single();
  
  if (checkError || !doodleData) {
    console.error('Error checking doodle ownership:', checkError);
    return false;
  }
  
  if (doodleData.session_id !== sessionId) {
    console.error('Cannot delete doodle owned by another session');
    return false;
  }
  
  // Delete the doodle
  const { error } = await supabase
    .from('doodles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting doodle:', error);
    return false;
  }
  
  return true;
}

// Comments related functions
export async function getCommentsForDoodle(doodleId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('doodle_id', doodleId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  
  // Convert the data to match our Comment type
  return data.map(item => ({
    id: item.id,
    doodleId: item.doodle_id,
    text: item.text,
    createdAt: item.created_at,
    sessionId: item.session_id
  }));
}

export async function addComment(doodleId: string, text: string): Promise<Comment | null> {
  const sessionId = getSessionId();
  
  const newComment = {
    doodle_id: doodleId,
    text,
    session_id: sessionId
  };
  
  const { data, error } = await supabase
    .from('comments')
    .insert(newComment)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding comment:', error);
    return null;
  }
  
  // Convert to our Comment type
  return {
    id: data.id,
    doodleId: data.doodle_id,
    text: data.text,
    createdAt: data.created_at,
    sessionId: data.session_id
  };
}

// Generate sample doodles for new users
export async function generateSampleDoodles(): Promise<Doodle[]> {
  // Check if we already have doodles in the database
  const { data: existingData, error: existingError } = await supabase
    .from('doodles')
    .select('id')
    .limit(1);
    
  if (!existingError && existingData && existingData.length > 0) {
    // We already have doodles, no need to generate samples
    return getAllDoodles();
  }
  
  // Sample cartoon-style doodle images
  const sampleImages = [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAD2ElEQVR4Xu2dMW4UQRCG7QAi5ISQAxDkJRABZ8gJgXMTYsJQuZdATJLAzSEBd+AMnIxEQEJIACLgDESImvWutF7P9vTurs301L91MjP/zD9fV1dXz+y9/X6/J/q0lcAnAtmWGx0jEGIuBAIh5hJgDodKiDkEmMMhEGIuAeZwqISYQ4A5HAIh5hJgDodKiDkEmMOZVQnb7XYnZTk5OfkjvouLi9G1i4uL0fXLy8vR9d1uN7pe3fP19XU0/vb2NrrmnnfHq2eqtbu7u/E47nPdderK+eXl5Wi8MVgqgZbPmQUhucluzf/UcSpDNf3qOTV+c3MzGq+TXs0nl7Uc37LAEggZs5xKKbkJnJpENzE1+W7yr66uRu+7uLgYvUdN7tTzYgnEigkJkZAKceopxn0+VgJGlbCrwhJQTEhW0yqQqVTlKqW+53chSW0XRq6tv7+/j56t5+t9nFuKS62V0rJqsVroHdWAFCey1tLb+VwV1VSbcgX9np+fj9Zo6pxKUNc1XSmNOYTW+8RC5FQrarFc2qnGcR/ivlcpQ+O7D7q+vh7NeafXj5XLqIS8JA+R4tRONSmlLF3TpLnvubeWqbb0aW5v5Mr5rvc04T6HiJTX19fR+3a73ehZum/rqUslOAVCUnFA3LSmxqte7o7nPn9vSrtrrRTprm+1a+OpdOuqZIxFSPvv1BO+VTuljFZ1NUZuilgEibNgL+0yoaW9clT1VGs45eA5a6ylcRIC2fRGQiA75CEhfAJZrgPBOWQd//jgdcgYIlRC+AVPJaQfEzmOVEK4jqESEpZAOocQCAnLIJWQfkz4OWIOPE59KiF+bVAJCdMFFaJyJTQO/n4Xkf7crwLJRUPKkZCQedUJJSEgVggJgWWUrIVICAiShIBAISFQCAmBQkiIX01DCYlhUoYIl0M4h4RLImwDJAQKISFQCAmBQkgIFEJCoJDc6b+EBGSCbYCEQCEkBAohIVAICYFCSAgUQkKgEBIChZAQKISEQCEkJMwj+G3ro2j4FRL+ww0ohIRAISSk/4zhHBImE84hYQ6hEsIveFJCREmYUKiE8AueSgg/Y0hImElICBRCQqAQEgKFkBAohIRAIbltX5UzuX3bqTqO8D1d0kBPl7DcHUwgRfeQkC4NEFJkG1TCLl3SQE+XNJAQIKTIIaiEXbqkgZ4uaSAhQEiRQ1AJu3RJAz1d0kBCgJAih6ASdumSBnq6pIGEACFFDkEl7NIlDfR0SQMJAUKKHMJMSDXJqiIup9Jj6n1z/lhFtd+bUPnzB0XwZv2QooDnuBQCIeZCIBBiLgHmcKiEmEOAORwCIeYSYA6HQIi5BJjDIRBiLgHmcKiEmEOAORwCIeYSYA7nNxGIN3A/RZkmAAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAEYklEQVR4Xu2dsW4UMRCG7QgUFCDRUFDwBDwAb8CTUNFQIAoKJCQKGlDScAUFBUjQQEMDEg+AxBtQ8QDU9Dnaz7o92bP2eG2v9+/O3mRn/v3H4/HOfbq4uDgn+jSVwCcCaYobDSMQYi4EAiHmEmAOh0qIOQSYwyEQYi4B5nCohJhDgDkcAiHmEmAOh0qIOQSYw1laCbvdbmdZptPT05HwLy8vR/cHg8Fo/Orqaj8yvs/P86Px8/PzfX+vvtvb2/24+0z3rwx1T/d0r9frfa7uM51j9b1/rPfs93q9wc99/e3Nzc3od/f39/tx5af7Oh/3uK/c+vylJbDkc5ZIyNSCdwt0ypT2k6LSuHveFpKgbPh+lUqII8U/EzmKlKWU4BK2hRIylRNKCXon51+SkDk2tUuKK0EKc+tV+0op4O3Ws01KjpRp5UwJIFDOFIYl+yqphGnl5EphqnTNIgUloDBV6iw5pOTIKdlrlsqZkoI0NMbIeXp6+kd+e3t7lGYfHx/3j91zut7c3Ix4HB4eju6rQ5DS00m77u7u9sed/PT9trb4qoM/rsb6+9XV1eh3h4eH++l6pWkPDg5GDVF9Ss4W00rTHjFbtiUVMvfLCle69LvKeT0rhleS9pazZTXkVEJspIRqz87O9smRZlLXqqDPVom7V70hx6BIcT1b+rltrWPO+54lfxB9qSpE/3X67+QLQvcq79NEKbi0EqKGnbZqoAqpZW2lw5e7yTS9lv/7Cqkp/VxCQo3X1ilr6j+B2LZVlZAUsGorJUJB1D+SlLXkwDXusZkKqZF01qrkXIW0ApUdAAFhR4jdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4fdHwFhx4ddX9ePlDwpI/ZHSpqUUfXNF0L3h9BWiTUt86kPeVQZoSP0NdBFExJqa03LSn6P8Q9b1rREsep3GBdNSKjjR+h+9K605h9FDo2H1sEOfTl0NR8AWTQhod1RQttxhCQXUss0Uv5BQtyN96J7Q7RE1/KWFVpLKBV6167iyxQCskhCcvam+xcNC1FN1/WswjZjXkaE7kXlLNz6+3vy1u1IWfszRosiBEXGlBmQ2M7mfHIXl8QJD0U3xSMu0tnc3/XS0/N/B19UCYmmfin2dvNCABBgEGIOAeZwCISYS4A5HCoh5hBgDodAiLkEmMMhEGIuAeZwqISYQ4A5HAIh5hJgDodAiLkEmMP5C+WTcgET0KHOAAAAAElFTkSuQmCC',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAFJUlEQVR4Xu2dQXITMRCGLQouHChO8ALgDXCjKrhRcOEGxSM4wAk4UMUbeAQ38AhA3oAbxQVOUMUrOFAc2PpVjtfarJSR1Jqx1PM7pZSxpdb/d/9SS9Zo9+nh4eEVfZpK4A2BNMWNhhEIMRcCgRBzCTCHQyXEHALM4RAIMZcAczgEQswlwBwOgRBzCTCHQyDEXALM4TCXcHx8bK6O7e3tTsfb29vdmpubm9oeN9/c3Oz22N3d7da4uVsw2LO6nrNnusedDw4OujW6Tp/pGl2jv6PX6jVuHrueeozFwlICUJ8zKyB9SfUlGGPnv+/xAJB8rAdQm+Pr4JAFsqRAvEdYAQqrgOTuZFfaetlz45JHTk9Pu2tgWWEvrMxdmwMy1FN+q0DOzs46y+sD4AjoWz/WOvxaOFdiS7KCvtu9AQT36d5e64GrxnohjMVcIwcQWJoHMre1jJ2fu/dPAjk4OOh6d47FJVlD97kU4qzG3YOvhcdZY0pVIT04S4y1tjFA3LVDk3z3+OvraxiEv0/3H/PcscfvUdBXVXVpqFarFZw9NYMw5B1jKcVZ/1j5ywkEYafrEB6Qmrxl+dTiUtZoQkL6QCitDKUX31PdZx8c5wlDlz4GE2BMpebeAMQqiFVtQnY91JN82uoDcnFxER7nPEaHi16r95RKf/5/gPDPcl6hz8d99b0aMmCMfUaJNTWAdMTDD7Rxj7MOd++YleieXAqFQRQCojfl7i/hifAKpDHc6/Nrtzjq5yGuoFB81mEL17v1SG3OOlDyolYA4n/fX/t/AWIJhUCu5x2TAvE9Fg8uWdFuLEvTVxz4HuvXoJ8BEJdygtYSvDZYO6Ywsebl7iEpqw+IszwEawXFpQ58DyzPgYD1+XsMpE98HiD+vm85CPMrBJKYrmgxJSaBQCAQQwkwh1JdR4/pIaW8Afc5iz0aO0o12h23NfQO7SVP3j5nD9Xrt2Ia6wUPIquc8TsUEAhEUSCpq6eWvB8CgUDUkr1iHdNuwUvIntZp1Gj0XnweMnfxq1R6YcoKbIVAIAoCtQTCOURxArUSQiW8PhxrISHsIWE6CluIgkC0oOxbxrvrWTAoI9JKQrQa7ashlMLYgjg7s9gGCAQmkEAgihPIWsrKfSfgLYyd7qsBpFb6al3hILCjoyN433MLCbGq8BzDi0CYsnQIATYhAiEQXVVQK5Xk0heDgrJtaSrKfL3mdAosfavrEUjYKxZ9gjF3zj4k2g3rXU1FySvnHW7NBx980B5i7kZUKZPxRGWFLaZJILomSyAEooOwrhvx1ZJ5Gwh7CIHIX60IhG0gTCFMWQoCtZKQnK1Xak/GmUpY7SHMy0aYsthDZIesDYiVA+u+vBDvfuiAyHiL/1HBRWXXqoCMWVWux/TBGvuZCP0N1J2l+ntQ9++Q8W+ipvyMxOzPKD2AZI+pVCMQt4hawhs7sI+elPzDir530EpA7u/vZ31XyRebmn5mXdUCQiAVAeHnXzXioZcxhbAPKUwadraaX6UvrNi/H9HQWl8w+BzMIHHKYsuKkGHKEiC0kBCmrAyhWskhwYH90C9dD/2kJPzYMe91apKQqt6H9J1q9pESQLxnICYfCcRfqKWA7OzsdKDcl5hT9WWJP3KW3O5+ktLvoOTu9qcgbJigXRGQFCivD0jfB0JKlq0x/6/mIQQS7gMEkkFKCwhTVgYprSREV2N1vXzMC55AbueoYOYhcp+oa48hkAxiWgGSA2LqlUFG2dXGgDBlFdRFFoXnFs8EUlAXWRRNIAV1kUXRBFJQF1kUTSAFdZFF0QRSUFVZFP0XnZScclGSQZ0AAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAEGklEQVR4Xu2dMW7bQBBFxzDiC1jOIbIpfQEfoT5BilyniZve0BcQ0qcJYCeVm+QGaVzbjexGgHUTApviLofUkuL3AxBwJO5y5nG5XJLLx7Ozs8/EnyEFeHh4oK/T6XTKLMy2bYfG9Xtd14P9dV33jpmm6anNsiwvbeu6fjZOU8ew16zrut/X7/joebdt+69P03XN2Hhf99icdYyfZ0kJLL2epRKydoOPbbAdWGtT9ieFs3FrzSkkEBsse4UqEQeKy3guUZZQAqOwLYyQtZxgKcj9mz1vFZA1NrVKCiohCrPtVe2rpIDdys4mJUXK2nJKAXAoZ4yCtfuKKWFtOaWUMMW6FpFCIqAweuoseaRgySlZs4RyxqQASgwhb5+dnf1ZfgdDRqPR0/YwDPv74/H46XjbtsN5Km0cVTu73e7pOl7H9701R9/yeb7164aLTfRfZgPF23anmcwGimN4ja7rvmp93O+nc9XO4+Pj0Oe36+vr/j3x+vj4+N8OvrHrWo1HqR6hSoiPf7xh5BxDQ8naO4y33kE0U7lKKeAuKSEl5AiABUIEX6cIhECYzQ8xXxGFBALxMG05BCJAiuUQAiEQQwKGh1IvRyluLMcQ9pDA/ZRDftHPQ/7gD4UcErBELYfYfJhD1ErhyroSCXyjKpfdei3NiO6A3i6ql7L+cAdrscVY+hbiNiaXFuJu93jHQaWLckjgXOYQm4/lkM3+HFhIJHTs6XsVBnXo4C35vW5MjmAcKEOD0MdudX6+9rK0DyGgwyCrVcsJS/0T6FVLe5wU5zrKsYN97XJkbc2eK9YX2TncPX/OngshhFBI4K7CbYBACGSNgHVY8XegKgGkZCGjeT0SnJkpUe5Pc198K0qM+z31/bfMc5vkWJTTLqS976tT9pVyb9jButSRO64/RPwfCQTiZcQekm4ivBE5hPOQJSQ4DxE/9RIIgSQkwO+yAqAwh7CHPLf4io88PEMIhE8MASCsFFYKK4VAeIYQSJ9DUimcGPK7LFYKKyXtDPYQViGBBLiGsA2xDTGHsA0RCIE8n4dwDTmGvcU2FPhl0toD+trz9Ycay77oM+XDppBxUx8O9b3D5feUDx3H5io2UH2g3pDHGsG0r/oQN2VclzJugi45UJceN3G/OH5o3NT9Yve4qfuKYxnT9/qp9xTf11ZlDIn9wB+XjS2GjBnz7ZWijnXHX9fqr4luy+OqEqKw3Cwr9YvR1t5PGxMtS67LaOtyjJLiuVdHSMyLUSnd5EL3tuT5dMn+vqKE2Jc8h+rWewKxJcTVuQWo94T4KGK7W3v+mvsXSYgqpFLX+9739isBjN1ZgkrLEsIcQuH5OXMIgTDIIczgzCEEQiAEQiAEQiAEEkiAvcKmwzZEIIEE2CtsOgRCIIEE2CtsOgRCIIEE2CtsOgRCIIEE2CtsOl8AyahGu3iQlsAAAAAASUVORK5CYII=',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAD2ElEQVR4Xu2dMW4UQRCG7QAi5ISQAxDkJRABZ8gJgXMTYsJQuZdATJLAzSEBd+AMnIxEQEJIACLgDESImvWutF7P9vTurs301L91MjP/zD9fV1dXz+y9/X6/J/q0lcAnAtmWGx0jEGIuBAIh5hJgDodKiDkEmMMhEGIuAeZwqISYQ4A5HAIh5hJgDodKiDkEmMOZVQnb7XYnZTk5OfkjvouLi9G1i4uL0fXLy8vR9d1uN7pe3fP19XU0/vb2NrrmnnfHq2eqtbu7u/E47nPdderK+eXl5Wi8MVgqgZbPmQUhucluzf/UcSpDNf3qOTV+c3MzGq+TXs0nl7Uc37LAEggZs5xKKbkJnJpENzE1+W7yr66uRu+7uLgYvUdN7tTzYgnEigkJkZAKceopxn0+VgJGlbCrwhJQTEhW0yqQqVTlKqW+53chSW0XRq6tv7+/j56t5+t9nFuKS62V0rJqsVroHdWAFCey1tLb+VwV1VSbcgX9np+fj9Zo6pxKUNc1XSmNOYTW+8RC5FQrarFc2qnGcR/ivlcpQ+O7D7q+vh7NeafXj5XLqIS8JA+R4tRONSmlLF3TpLnvubeWqbb0aW5v5Mr5rvc04T6HiJTX19fR+3a73ehZum/rqUslOAVCUnFA3LSmxqte7o7nPn9vSrtrrRTprm+1a+OpdOuqZIxFSPvv1BO+VTuljFZ1NUZuilgEibNgL+0yoaW9clT1VGs45eA5a6ylcRIC2fRGQiA75CEhfAJZrgPBOWQd//jgdcgYIlRC+AVPJaQfEzmOVEK4jqESEpZAOocQCAnLIJWQfkz4OWIOPE59KiF+bVAJCdMFFaJyJTQO/n4Xkf7crwLJRUPKkZCQedUJJSEgVggJgWWUrIVICAiShIBAISFQCAmBQkiIX01DCYlhUoYIl0M4h4RLImwDJAQKISFQCAmBQkgIFEJCoJDc6b+EBGSCbYCEQCEkBAohIVAICYFCSAgUQkKgEBIChZAQKISEQCEkJMwj+G3ro2j4FRL+ww0ohIRAISSk/4zhHBImE84hYQ6hEsIveFJCREmYUKiE8AueSgg/Y0hImElICBRCQqAQEgKFkBAohIRAIbltX5UzuX3bqTqO8D1d0kBPl7DcHUwgRfeQkC4NEFJkG1TCLl3SQE+XNJAQIKTIIaiEXbqkgZ4uaSAhQEiRQ1AJu3RJAz1d0kBCgJAih6ASdumSBnq6pIGEACFFDkEl7NIlDfR0SQMJAUKKHMJMSDXJqiIup9Jj6n1z/lhFtd+bUPnzB0XwZv2QooDnuBQCIeZCIBBiLgHmcKiEmEOAORwCIeYSYA6HQIi5BJjDIRBiLgHmcKiEmEOAORwCIeYSYA7nNxGIN3A/RZkmAAAAAElFTkSuQmCC'
  ];
  
  const sessionId = getSessionId();
  const alternateSessionId = uuidv4(); // For "other users" doodles
  
  // Creative prompts for sample doodles
  const samplePrompts = [
    "A happy face with big eyes",
    "Red heart drawn with love",
    "Rainbow colored butterfly",
    "Abstract shapes and patterns",
    "A green monster with polka dots",
    "Funny cartoon character",
    "Colorful scribble pattern",
    "Star and moon doodle"
  ];
  
  // Prepare sample doodles for insertion
  const sampleDoodles = [];
  for (let i = 0; i < 6; i++) {
    const newDoodle = {
      image_url: sampleImages[i % sampleImages.length],
      prompt: samplePrompts[i % samplePrompts.length],
      session_id: i % 2 === 0 ? sessionId : alternateSessionId,
      likes: Math.floor(Math.random() * 10)
    };
    sampleDoodles.push(newDoodle);
  }
  
  // Insert the sample doodles
  const { data: insertData, error: insertError } = await supabase
    .from('doodles')
    .insert(sampleDoodles)
    .select();
    
  if (insertError) {
    console.error('Error creating sample doodles:', insertError);
    return [];
  }
  
  // Convert the data to match our Doodle type
  return insertData.map(item => ({
    id: item.id,
    imageUrl: item.image_url,
    prompt: item.prompt,
    sessionId: item.session_id,
    createdAt: item.created_at,
    likes: item.likes
  }));
}


