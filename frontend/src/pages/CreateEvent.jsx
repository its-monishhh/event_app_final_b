import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

export default function CreateEvent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        title: '', desc: '', date: '', loc: '', cap: 100
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            if (!u || (u.role !== 'organiser' && u.role !== 'admin')) {
                navigate('/');
            }
        } catch (e) {
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('desc', form.desc);
            formData.append('date', form.date);
            formData.append('loc', form.loc);
            formData.append('cap', form.cap);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data', // Browser sets this automatically with boundary
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create event');

            navigate('/events');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="h2">Create New Event</h1>
            <div className="card">
                {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Event Title</label>
                        <input className="input" name="title" required value={form.title} onChange={handleChange} placeholder="e.g. Tech Meetup 2025" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Date & Time</label>
                            <input className="input" type="datetime-local" name="date" required value={form.date} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Capacity</label>
                            <input className="input" type="number" name="cap" required value={form.cap} onChange={handleChange} min="1" />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Location</label>
                        <input className="input" name="loc" required value={form.loc} onChange={handleChange} placeholder="BMSIT" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Event Image</label>
                        <input
                            className="input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Description</label>
                        <textarea className="input" name="desc" rows="4" value={form.desc} onChange={handleChange} placeholder="Tell us about the event..."></textarea>
                    </div>

                    <button
                        className="btn"
                        disabled={loading}
                        style={{ backgroundColor: '#28a745', borderColor: '#28a745' }} // Green color as requested or implies change
                    >
                        {loading ? 'Creating...' : 'Publish Event'}
                    </button>
                </form>
            </div>
        </div>
    );
}
