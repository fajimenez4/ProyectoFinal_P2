export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
        try {
            data = await response.json();
        } catch {
            throw new Error('Respuesta inválida del servidor (JSON mal formado)');
        }
    } else {
        // Respuesta no-JSON (html, texto, etc.)
        const text = await response.text();
        const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 300);
        if (!response.ok) {
            throw new Error(`Error del servidor (${response.status}): ${snippet || response.statusText}`);
        }
        // Si la respuesta fue ok pero no es JSON, devolver el texto crudo
        return text;
    }

    if (!response.ok) {
        // Si la API devuelve { message } lo usamos, si no mostramos algo útil
        const message = data?.message || JSON.stringify(data) || `Error en API (${response.status})`;
        throw new Error(message);
    }

    return data;
}
