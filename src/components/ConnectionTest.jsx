import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ConnectionTest = () => {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState(null);

    const testConnection = async () => {
        setTesting(true);
        setResult(null);

        try {
            const response = await api.get('/health');
            setResult({
                success: true,
                message: 'Connected to Railway backend successfully!',
                data: response.data
            });
            toast.success('Backend connection successful!');
        } catch (error) {
            setResult({
                success: false,
                message: 'Failed to connect to backend',
                error: error.message
            });
            toast.error('Backend connection failed');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', margin: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Backend Connection Test</h3>
            <button 
                onClick={testConnection} 
                disabled={testing}
                className="btn btn-primary"
            >
                {testing ? 'Testing...' : 'Test Connection'}
            </button>

            {result && (
                <div style={{ 
                    marginTop: '16px', 
                    padding: '16px', 
                    background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    border: `1px solid ${result.success ? 'var(--accent-emerald)' : '#ef4444'}`
                }}>
                    <p style={{ color: result.success ? 'var(--accent-emerald)' : '#ef4444', fontWeight: 600 }}>
                        {result.message}
                    </p>
                    {result.data && (
                        <pre style={{ fontSize: '12px', marginTop: '8px', color: 'var(--text-muted)' }}>
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConnectionTest;