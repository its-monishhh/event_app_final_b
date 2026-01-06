import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import EventCard from '../components/EventCard';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/events`)
            .then(res => res.json())
            .then(data => {
                setEvents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="animate-in">
            <div style={{ marginBottom: '40px' }}>
                <h1 className="h1">Explore Events</h1>
                <p style={{ color: 'var(--text-muted)' }}>Find events that match your interests.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : (
                <div className="grid">
                    {events.length > 0 ? (
                        events.map(e => <EventCard key={e.id} event={e} />)
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No events found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
