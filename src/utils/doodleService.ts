
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
  
  // Simple cartoon-style doodle images - very basic to ensure they're clearly not photos
  const sampleImages = [
    // Basic smiley face
    'data:image/png;base64,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',
    // Simple heart
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAEf0lEQVR4Xu2dT2sTQRjGn0mbtE1rLVStilb8gCIeBG/2C3jwohe/gAcP3qUXT30vHqQXT+JFvFREpLRFDKKI1VYUP0CLtmm67tbZzbObf5Odmdndect5M/PO8/zuyczOJgnFxxgCiTFVREkgYJAQIJANBEI2EQgYCAQMAgGDQGBnEAQJBIFAYGcQBAkEgUBgZxAECQSBQGBnEAQJBIFAYGcQBAkEgUBgZxAECQSBQGBnEAQJBIFAYGcQBAkEgUBgZxAECQSBQGBnEAQJBIFAYGcQBIFAx+0Mvbydbv4T6v3uzqK9e0r0/8nqVn9y5fa9xfrVUafQnhub9Ymp2s/Xr56pv19sHTbtXzB/U/aOnn15Wbv/aXZC6e/B0T+jtZMDW/r7z+nfQ+k5hfm721fqH+dnGm2XDhbrE5O1n6+n86uWnp9fcIO0BO7jQHdncenr4MuZu/cn1+anynuqE39sVYqLe7vdTnK8jBwECQSBIGBvQ4gl4dj6cbdG7x3YHZ8+TNJQRF5CQnpOx9n4I5eLN98vubyVONvZlWUDZG9ytHTa/GlnhIeRZ/mzAeFonM7VlpHneyGjF4hwBDICbyB7358MnHy2MpLMLBYWHs2szd0aba4OrF5YSdcAspiFLw1FpKsh7Q67i4dHtv1c+vBo7ljz6ejC6t/CxAPb9c/l4VTvzs3xsfUOl/xaCsQGw6Zk09fr97qF3Cebd9O8m1/pOkCUPTrcsZHY1FTKCVrL91TyttKhG8h7F4GHAtBU1FWhOCcmEKUQ0jTQUpStsIbxRFfXeYykErqAaClwFno7vQBxCzzcgVDnFHIB0S1G3SvLFoJpXrz77N41HJvcUco3M+oEks7aXKugznuXnEBc4LlWDEcJWjqv0g1HK41fXXgzDCRkJXAVUOiCzbW6s3R2YVMXfK7ro3lzglZBRwbSVTpyOtTpDL6bFoaqvK4B4MhvVjidNYGrymjOAOIGIhUm5ZSdnflswMyEoTp3uCISGYh0mdB99taRdBdj3YlC9zktLSQgJp9NVbqNjkxCIgIx9RyuzU9lxSpvxMsDvXWhXXVNtcG0OuK8RlIGYnold5Fm67RV+10G0FRwtlygfTlBGYjL6tctcGkQqg2eS1XEan5lIKYNR2j12ErX9UVxVwdCCD4a08o52872SH1kGUismeZQPnYsIJIXQTp5G9fnCIjve6Ienk+7whQoPCDdfEc3OKfbGgRm2Rlo7BxHbJPRCIE0LoDq6A9cwVbUkK4qQFRjMd16hjwLQLIUHKKQ2mEgXbiHS4JS2RAUuIXROsZlEfxI5aNXhC0AiRmdZB5HQFzfMWVZDUHWN7vXXvOwVUAQQAIXYQR5BgERzr+shiS2sHQtj0oHkoHg/H415tQ/AgGDIJBAEAgEdgZBkEAQCAR2BkGQQBAIBHYGQZBAEAgEdgZBkEAQCAR2BkGQQBAIBHYGQZBAEAgEdgZBkEAQCAR2BkGQQBAIBHYGQZBAEAgEdgZBkEAQCAR2BkGQQBAIBHYGQZBAEAgEdgZBXN8CZdypKAu3jKD9gawgSCDbEkggi0Qg/wHls5WIEjQZPgAAAABJRU5ErkJggg==',
    // Basic star
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAADyElEQVR4Xu3dMWsUQRQH8JnZJIeFilhYiKKFYKE2KaxtrMTOR7ASrCys7C1EsEgVSGEarSxsrEVQEEHbIKJJzM3uzKzz9vYiAbm72Tczu+//QEjgdvf/frM7s3d3meDDKAFm1Bs4jQAIaCIAEAABCmA0gDMEQIACGA3gDAEQoABGAzhDAAQogNEAzhAAAQpgNIAzBECAAhgN4AwBEKAARgM4QwAEKIDRAM4QAAEKYDSAMwRAgAIYDeAMARCgAEYDOEMA5AQK7Hbvntvr9lZms5lXvYbj8ag/7Pf/XBwOH+dec6/Xs1e63U/1ev1pyvW8z2e320aez+61Ws07IuIixOHhoS/L8m2WZU8opc9SvM/xnIOn+9hwGG4KIb4KIZ5JKdeI6JsxZmNvb683mUx+nvTeWZYVy8vLDwaDwVpt/9/n0YdKKW2e56vnz5371O12P8znc2utfTEej19Za3dPg0Ce59fa7fa7oii+W2tfj0ajZ8aYO41G486ZM2c2D4Jof7+fCSFWut3uhyzL1o0xr8fj8WNr7dVGo/Gg2Wz+OJQf0h+Uid7V1nA4vLG9vZ1Nf9cFTvnk/XuO9Pc8z7ParNfrleVIGGZ6bH7XGYQ+Hc5XVjGeA9FGSilQSg0fQfSXCXvGeGut9XdpygPH+ucbdNqCEV5HtdrH/3Ms9Fh6WGvpAUR/qbD3SjP1P2OMlVJ6pZRxzpEQwsXKJjbGqFaUUmHQIy7UYRe+kAlvlu8RQPQXC2VQIfWaRn9lk1prPLVq5KRzzsX7nbV2wTsU/UXDGY4oW7NV4aSbzhnVCptgnPMnFsdQFkkgdkTTUEp+jRPOGBc3ZlZKWd0g+v2+HnLHGBMnYJIXfr46U5xzfr6VB3NeqWRHauhvGG4SuwWQo+5Tqoq+0SCqfQiAnKahRJXrBaBHL4AAxH8CKccqKHeYZ4Yo0366G7JGXbuHXRaAxA4haQYR5qMqKzUIrZQx034JQOKHkKrPQmtGSjfDHWZFAiDZP0MCUc51wBDTnq2N/ORF1We1trnYqcFzgCGl0tvo475O7UE455tV1/zTBqENJOWYlXT8kwii9rzb5hxS9fJGKSWklF4p5YwxsahOKoxkUyptkFKUU0JeaMfEyhpRncQYxGlD2FkKx18TQByNQ/41QKq8kC6UAyCpzuDi71Fp5aUGEMfz2GcLoADEBwSAAARAAKMDnCEAAhTAaABnCIAABTAawBkCIEABjAZwhgAIUACjAZwhAAIUwGgAZwiAAAUwGsAZAiBAAYwGcIYACFAAowGcIQACFMBoAGcIgAAFMBrAGQIgQAGMBnCGAAhQAKOBfwPAwkgPC3dlAAAAAElFTkSuQmCC',
    // Simple cloud
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAADfElEQVR4Xu3dTWsTQRgH8JndJm1TqC1FK/UNFK0HQcSLIHgVvAiCHyEfQDx4tnoRRBDRkyB4EkFQUKGCVVFpa982zc7szL6TNmlLNrvPbHbn2X8JSWYy/+f3zOzOzmZDhA+rBMiqN3AaAiCgiQEIgAAFMBrAHgIgQAGMBrCHAAlQAKMB7CEAAhTAaAB7CIAABTAawB4CIEABjAawhwAIUACjAewhAAIUwGgAewiAAAUwGsAeAiBAAYwGsIcACFAAowHsIQByDAVKpdLZdrt9utFoVPYXp9frXQ6CoFYsFt/lcrlGmvWvVqvT0+32pUrlfJrlHFZWKvf7QRC86Pf7b7rd7u8kZSV+Vvd6veudTmeaaVqu1+vfkpzgqM+cm5vreZ73LQiCF51O542UcnVycvLJ7Ozszr9AMp3O00Lh5of5+flNpdSTVqt1e2VlpdjtdhedTuezlHIjaddMejzTJPeFgr87Pz9fbTab1/r9/prv+w+Xl5cfSCnXjvrOnAkmJg62t/f2trZW3Z2dtz/q9cVOt/tz0O9/zOn8yQBVtVTa9zxv0vO8Kdd1T1mGEeXNSWn+1aG9vb05KeW2EOJHtVr9NRhAn5lZYYyp8fHxDc/zXpdKpdV/gbgHBx92d7cmTdNccxwzPNvg49egzNFzQwgzfE4Px35Xr7sHg8FnIUT9OJCdubk3juPEYeiaWSkVA4yvAcRRJKZJuqvEQZx9YMw5WBfCHf4cEIIreqXFn1VKDUF0H9E1PenELw6iG/zIkl4XcRDdoHXvSAvxf0CMYnrtpBXTcuHXBzEDrXtFWrG0X8NDgeisN4ldSK+RNMtzXePXBzEDredJWvE0XsdDg6Sa6DIcZ/FpvTZALoTfbttznJFTBiESS2mXaHq3xLVrAJKEZ9Rj1DpJLINu0PODxCG4QidROfqYqN3qbLx6I3/4yB7EjKWeeHN2iA6SS2CasV7BObvEBaLXi14vuj4dmOHm64KfL8gwC+9ObmtZzlq9Bjhb4szCT+0qK+JiOrW0i2RccbPwnCE7y3GFteOAwQHEHgND5wSQA4PSvRSBH+TgBHtI4gW+UzMfGT3kX1ddSQ/gPo41hPNkTlOOLSMMIbHNrPj0Eb+Uynato8lYQI5GFfsfAIQdKP7EAASfib0GgNhj4q8BIPiM7DUAxB4TeeJfn6Sj0W0aRPQAAAAASUVORK5CYII=',
    // Simple flower
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAEUklEQVR4Xu2dO28TQRSFz13vOnYIECDxKGigQFRAQUFFR0FFQ4ESCQo6aipKKigQoqKjoqGCBhpKKhoEAiQeAQIJnGDD2uuduTAT2wkJcbyzM7P3zP5nY3szc+fMd8/M7NoZj4gfZwh4zrRFjUQgDkUBgQDIIQ+gFsAhAOIQAw61Ag4BEIcYcKgVcAiAOMSAQ62AQwDEIQYcagUcAiAOMeBQK+AQAHGIAYdaAYcAiEMMONQKOARAHGLAoVbAIQDiEAMOtQIOARCHGHCoFXAIgDjEgEOtgEMGCKRSqVzKZDIXi8XipExt1Gq1i57nvY+i6Gm9Xn8lU9Z0WdlsdjGXy92LouhFvV5/J1NWP8vSApLL5S6Gvn9HRmk/y8pkMnP5fP6F7/t3ZZRdLBZnWq3WrSiKHnU6ne8yZUpDKZfLUaFQuO/7/t04jp+0Wq3HaZeThjwVIKlNxNrE5HK5231Cc9PtdmWavD/kBEFwQ7jk8UrQojRXVqsoS5sW2Qu5MAxF7gMRgxgSCsIxKitbv0RrA1Kqzh55/lidFg4RMYjhhxufu71Wo9Wo7ct0JmLtH9J3hihbZ6ryWkBELH+8YRjGDyWlGIhDYBKnCLf8mc1mn4p9OvklVDAWAy3zlR2HaHGISLTFMp497xAF10iLpwpEJN5nLxQeJrTnHWJJos0EQsvUZXREm1OWpeg2EwidstJZJO1PAZIUiC0J+qCAyLpk0A45qM3QLUUgBKJiD2nEMYJhyYhRufQiEAIhEO7UQ9nDVKYsArGkK6YyZRHITqYsDhtAkpiSlEsgyl8QbTgEQHZsdtmNlC3F27UcAlFJtC1JMYFQmd2NnQSyy95GIARCh/CS/18OEFXblnIIhEAOZGPlFG9X2QRCIARCIHQIgdgyS/FBVf4pBkIgTLT/eiCzN4FwDyEQzcmmop4AREUqw2UAiGGAKqoDiKpkBssBEMMAVVQHEFXJDJYDIIYBqqgOIKqSGSwHQAwDVFEdQFQlM1gOgBgGqKI6gKhKZrAcADEMUEV1AFGVzGA5AGIYoIrqAKIimcFZXQAxCFFFdQBRkcvs4iNMXQZBqqgOICpymd27AIACK6F8TeICGxZdAiAWdUuFaQBRYcmiSwDEom6pMA1AKqxYdA2AWNQtFaYBSIUVi64BEIu6pcI0AKmwYtE1AGJRt1SYBiAVViy6BkAs6pYK0wCkwopF1wCIRd1SYRqAVFix6BoAsahbKkwDkAorFl0DIBZ1S4Vp/QJiZCnJfvS4KoZVlNPPsoz9Ygl+lKbt7f1yiPiZ2Gq1Wjc6LySBKL64/f5Kv5yxdFtqhw368U69PvYzRs+TvtokCILrsht3EAQ3fd9/LrtSVr/KWrSl0WjMRlF0pdlsnpBltFqtTvq+/z6O46eNRkPZa0tlbRh2eQCigtSAygAQFaQGVAaAqCA1oLIARMWvNCCzAKSBzoCKBBAVpAZUBoCoIDWgsgBEBakBlQUgKkgNqCwAUUFqQGUBiApSAyrrf8ejyTLHI0WrAAAAAElFTkSuQmCC',
    // Simple house
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAC/klEQVR4Xu3dMW4TQRTH8ffGa5NACCJRQIGgQUJCggIhUVJQUFOAKOhoKCmgQ0gUCEpEQ4GoKaGgoEA0IOV8AOA9PBvHwY53d3byZv6/yrE9b2Z/b+Jde+wSPkoJUKm0FJOAKFkEAQGIEgJKYlAhAKKEgJIYVAiAKCGgJAYVAiBKCCiJQYUAiBICSmJQIQCihICSGFQIgCghoCSG3UNZlkfM/Nbdz5vZR2Z+V9f1pyRTbRlk8xAss6yq6lJVVZ+3zXXX758NpAPxnZnfMPOt9k+5+8tZlj3I8/z7rs+j6/g7AbJudhMw7v6ImR/XdX11J9N1HHQvQH4AyfP8YlVVb9qx3f1xnuePuibsOn7vQNpzQJZlL+q6vrN0jnH3G+7+LITQOUZPHixAUsxNXqWQoPY5BiAp6CZ+JwDiPoTwKIRQpxgjxRhUyILkh+aQpt4UY6QYgwpZQJfizEiFLKCgQjKUE0BSZIMKSUCPQxJAogvfQ6gQKoSvvQu48BySKuMUY1AhC0JSlZNiDCoEQPjeOxYXvvYm+hrV5UOFpKCb+J0AiPsQwuMQQp1ijBRjUCELkh/aZbW1pxgjxRhUyAI6zjKUpXotrRuQuq7PzWazV91jDB+hd4fVjZn9zSxXq6p6fWgwvYG0UGazsw9DCFfadXJ3PwkhPDm0KqkjjD5B2q7p/vHxUydJ0m6oYebl5eVaeznt3dXV1V91Xf9oIZRleWo+nx8zc9skn2fmb03TfGHmc03TXGmaZn7IcxvNZnN6enrxPATK83zz6urql5mtmd2Ya/enPX/3yMx+9TFu3zF6BRnCUnph1/sp9BZkqOIMrSyADG1FB5KXChlIGYcYlgoZYimHmBMVMsSFHWJOABliKYeYExUyxFIOMSeADLGUQ8wJIEMs5RBzAsgQSznEnAAyxFIOMSeADLGUQ8wJIEMs5RBzAsgQSznEnACiZJEBiBICSmJQIQCihICSGFQIgCghoCSGkhj/AAHrLdJWpTUAAAAAAElFTkSuQmCC',
    // Simple tree
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAADhElEQVR4Xu3dP24TQRTH8d+bXWMnIUGioaOioOEEHAWqoKGgoEdCouAAFBQcAAkJxEnoOAAFTURHRQM0kWLtBvZlZxPHu7Ozfjvj9/tUOLF3Zt58PLaT9Y6JHqUETKm0MiaBKFkEAUEgSggoiUGFAIgSAkpiUCEAooSAkhhUCIAoIaAkBhUCIEoIKIlBhQCIEgJKYlAhAKKEgJIYVIhvIOPx+JSZTdz91MzeufvHuq7f+R5vneNNYJm7y/P8dlVVr5c954+qql4opOAVyGQyuVRV1etlEL7v7t9nWXa9ruuP2kD5AuLwpihKfVzLsjxj5ndpmt6squrJqjF9APEKo50kz/Mbsyx7mmXZtaqqXkqs6/0AcUJSFMWDJEl2J5PJfXe/kqbpXl3XHySB+QTiBUmWZSfrur7t7o+TJDmeTCZ7KWG4O4FIw1hWRpqmJ6bT6ZtFnax0YL6AiCNZNdmyMlYtOimQECBeq2TZ+y3Lshvz+XxvwxCif5QViKSwFnKW5/l9d38cqkpigGxVJQGrJAaIdZXMZrOz7n4vVJXEArGuEndH/OEbM9sLUSUxQMSrpL1bOxwOL7j782VfodbN6fPfjfZ9ZL5bG6pKAEQpbwABEABRQkBJDCoEQJQQUBKDCgGQfyUwHo/Pm9ltM/sUwzbK2pmUaKtCiqK45+5PmflnkiTnh8PhVwlMUsYACFFdLPt1hTAcDq86taUMEsYAiCSNxhhhDCpEUh2NMcIYVIikOhpjhDGokJbAaDQ652XeEcagQgCEr73eK4RzCOcQziGcQ9qFwDlEfEynrSTdz9S3TqqEISiBSI8tX7VFLe1dTe1srTQIgGgBwjlEeJMU7Kt5W45Rm9ACgUjTaIwRrgHCGFSIpDoaY4QxqBCm3Xu/7MI5RJhGrTHCGFQIgHDK8l4hnEOEadQaI4zRWYVYb3m1QiK9dSn9+tAZkLLcv+TuT9dNCUCkS9UxjkA6giaxmUAktDbH0AGk+QiZ/b1YLM642X6a7j91978/YCfRhqUDnUIXpvJtfHd3mKbpaXffb0CY+R8zf5pOp1+WpY39n2OAhFzRBrZWIMHSDrhhAAmIfZNNAWST9APuG0AC4t9k0/8BSI2curYFYyYAAAAASUVORK5CYII='
  ];
  
  const sessionId = getSessionId();
  const alternateSessionId = uuidv4(); // For "other users" doodles
  
  // Creative prompts for sample doodles
  const samplePrompts = [
    "A happy smiley face",
    "Simple red heart drawing",
    "Yellow star doodle",
    "Fluffy cloud in the sky",
    "Colorful flower",
    "Little house with a chimney",
    "Green tree with branches"
  ];
  
  // Prepare sample doodles for insertion
  const sampleDoodles = [];
  for (let i = 0; i < sampleImages.length; i++) {
    const newDoodle = {
      image_url: sampleImages[i],
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
