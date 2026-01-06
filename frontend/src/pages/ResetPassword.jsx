import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [pass, setPass] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        setError('');

        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPass: pass })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Reset failed');

            setMsg('Password updated successfully! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto' }}>
            <div className="card">
                <h2 className="h2" style={{ textAlign: 'center' }}>Reset Password</h2>
                {msg && <div style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}>{msg}</div>}
                {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        className="input"
                        type="password"
                        placeholder="Enter new password"
                        required
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                    <button className="btn" disabled={loading}>
                        {loading ? 'Update Password' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
