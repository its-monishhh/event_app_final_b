import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
    const date = new Date(event.date).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '160px', background: event.image ? `url(${event.image}) center/cover` : 'linear-gradient(45deg, #1e293b, #0f172a)' }}>
                {!event.image && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', fontWeight: 700, fontSize: '3rem' }}>EVENT</div>}
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {event.loc || 'Online'}
                </div>
                <h3 className="h3" style={{ marginBottom: '8px', lineHeight: 1.3 }}>{event.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', flex: 1 }}>
                    {event.desc?.substring(0, 80)}{event.desc?.length > 80 ? '...' : ''}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{date}</div>
                    {/* For now, just a button, later link to details */}
                    <Link to={`/events/${event.id}`} className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>View</Link>
                </div>
            </div>
        </div>
    );
}
