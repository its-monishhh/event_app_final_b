import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import EventCard from '../components/EventCard';
import { Link } from 'react-router-dom';

export default function Home() {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/events`)
            .then(res => res.json())
            .then(data => {
                // Sort by newest? Or randomized? Just take first 3 for now
                setFeatured(data.slice(0, 3));
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <div style={{ textAlign: 'center', padding: '60px 0', marginBottom: '40px' }}>
                <h1 className="h1 text-gradient" style={{ marginBottom: '24px', fontSize: '4rem' }}>
                    Unforgettable Events,<br />Crafted for You.
                </h1>
                <p style={{ maxWidth: '600px', margin: '0 auto 32px', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                    Discover, create, and join the most exciting events in your community.
                    The future of event management is here.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link to="/events" className="btn" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Browse Events</Link>
                    <Link to="/create" className="btn" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Create Event</Link>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <h2 className="h2">Featured Events</h2>
                <Link to="/events" style={{ color: 'var(--accent)', fontWeight: 600 }}>View all &rarr;</Link>
            </div>

            <div className="grid">
                {featured.length > 0 ? (
                    featured.map(e => <EventCard key={e.id} event={e} />)
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px', background: 'var(--glass)', borderRadius: '16px' }}>
                        No events found. Be the first to create one!
                    </div>
                )}
            </div>
        </div>
    );
}
