import { useState } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', pass: '', role: 'user' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const endpoint = isLogin ? '/login' : '/register';

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            if (isLogin) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Dispatch custom event or use mechanism to update Navbar?
                // For simplicity, just reload or navigate. Nav won't update automatically without context.
                // Let's just navigate.
                window.location.href = '/';
            } else {
                // Registered, now login
                setIsLogin(true);
                setError('Registration successful! Please login.');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto' }}>
            <div className="card">
                <h2 className="h2" style={{ textAlign: 'center' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name</label>
                            <input className="input" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</label>
                        <input className="input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
                        <input className="input" type="password" name="pass" placeholder="••••••••" value={form.pass} onChange={handleChange} required />
                    </div>

                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>I am a...</label>
                            <select className="input" name="role" value={form.role} onChange={handleChange}>
                                <option value="user">User (I want to join events)</option>
                                <option value="organiser">Organiser (I want to create events)</option>
                            </select>
                        </div>
                    )}

                    <button className="btn" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                    {isLogin && (
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <a href="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot Password?</a>
                        </div>
                    )}
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { setIsLogin(!isLogin); setError(null) }} style={{ background: 'none', color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}>
                        {isLogin ? 'Sign up' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
