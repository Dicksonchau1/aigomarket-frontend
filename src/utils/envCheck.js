export const checkEnvironment = () => {
    const required = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_API_URL'
    ];

    const missing = required.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        console.error('Missing environment variables:', missing);
        return false;
    }

    console.log('??All environment variables loaded');
    console.log('Backend URL:', import.meta.env.VITE_API_URL);
    return true;
};
