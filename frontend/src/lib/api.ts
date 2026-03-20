import { supabase } from './supabase';

const API_BASE_URL = 'https://wellbot-global-wellness-assistant-chatbot.onrender.com';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error('Not authenticated');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${session.access_token}`);
    // We can temporarily keep X-User-Id for backwards compatibility until backend is fully updated
    headers.set('X-User-Id', session.user.id);
    headers.set('Content-Type', 'application/json');

    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers,
    });

    return response;
}
