import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [regForm, setRegForm] = useState({ phone: '', details: '', usn: '', branch: '', semester: '' });

    useEffect(() => {
        fetch(`${API_URL}/events/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Event not found');
                return res.json();
            })
            .then(data => {
                setEvent(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleRegister = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        setRegistering(true);
        try {
            const res = await fetch(`${API_URL}/events/${id}/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(regForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to register');

            alert('Successfully registered!');
            // Refresh event data to show updated count
            const updated = await fetch(`${API_URL}/events/${id}`).then(r => r.json());
            setEvent(updated);
        } catch (err) {
            alert(err.message);
        } finally {
            setRegistering(false);
            setShowModal(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            navigate('/events');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
    if (error) return <div className="container" style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!event) return null;

    return (
        <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
                height: '300px',
                borderRadius: '16px',
                background: event.image ? `url(${event.image}) center/cover` : 'linear-gradient(45deg, #1e293b, #0f172a)',
                marginBottom: '32px',
                display: 'flex', alignItems: 'end', padding: '32px'
            }}>
                {!event.image && <h1 className="h1" style={{ margin: 0, opacity: 0.2 }}>EVENT</h1>}
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <h1 className="h2" style={{ marginBottom: 0 }}>{event.title}</h1>
                    <div className="badge">{event.registered || 0} / {event.cap} Registered</div>
                </div>

                <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                    <div>📅 {new Date(event.date).toLocaleString()}</div>
                    <div>📍 {event.loc || 'Online'}</div>
                </div>

                <p style={{ lineHeight: 1.7, marginBottom: '32px', color: 'var(--text-muted)' }}>
                    {event.desc || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn" onClick={() => setShowModal(true)} disabled={registering || (event.registered >= event.cap)}>
                        {registering ? 'Processing...' : (event.registered >= event.cap ? 'Event Full' : 'Register Now')}
                    </button>

                    {/* Simple check: if valid token exists, show delete (backend will verify ownership) */}
                    {/* In a real app we would check user ID vs event.createdBy */}
                    {localStorage.getItem('token') && (
                        <button className="btn btn-ghost" onClick={handleDelete} style={{ color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)' }}>
                            Delete Event
                        </button>
                    )}
                </div>
            </div>
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
                        <h3 className="h3">Registration Details</h3>
                        <p style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Please provide additional info.</p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>USN</label>
                            <input
                                className="input"
                                placeholder="1BY..."
                                value={regForm.usn}
                                onChange={e => setRegForm({ ...regForm, usn: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Branch</label>
                                <input
                                    className="input"
                                    placeholder="ISE"
                                    value={regForm.branch}
                                    onChange={e => setRegForm({ ...regForm, branch: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Semester</label>
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="5"
                                    value={regForm.semester}
                                    onChange={e => setRegForm({ ...regForm, semester: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Phone Number</label>
                            <input
                                className="input"
                                placeholder="+1 234 567 8900"
                                value={regForm.phone}
                                onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Comments</label>
                            <textarea
                                className="input"
                                rows="3"
                                placeholder="Any comments?"
                                value={regForm.details}
                                onChange={e => setRegForm({ ...regForm, details: e.target.value })}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>Cancel</button>
                            <button className="btn" onClick={handleRegister} disabled={registering}>
                                {registering ? 'Processing...' : 'Confirm Registration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
