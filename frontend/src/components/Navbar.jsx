import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const loc = useLocation();
    const isActive = (p) => loc.pathname === p;

    return (
        <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '24px 0', borderBottom: '1px solid var(--border)',
            marginBottom: '40px'
        }} className="container">
            <Link to="/" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800', color: '#fff', fontSize: '1.2rem'
                }}>EMS</div>
                <div>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', lineHeight: 1 }}>Event Management System</div>
                </div>
            </Link>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <NavLink to="/" active={isActive('/')}>Home</NavLink>
                <NavLink to="/events" active={isActive('/events')}>Events</NavLink>
                {(() => {
                    try {
                        const u = JSON.parse(localStorage.getItem('user'));
                        if (u && (u.role === 'organiser' || u.role === 'admin')) {
                            return <NavLink to="/create" active={isActive('/create')}>Create</NavLink>;
                        }
                    } catch (e) { }
                    return null;
                })()}
                <Link to="/login" className="btn" style={{ padding: '10px 24px' }}>Login</Link>
            </div>
        </nav>
    );
}

function NavLink({ to, children, active }) {
    return (
        <Link to={to} style={{
            color: active ? 'var(--primary)' : 'var(--text)',
            fontWeight: active ? '600' : '500',
            position: 'relative',
            fontSize: '0.95rem'
        }}>
            {children}
            {active && <div style={{
                position: 'absolute', bottom: '-34px', left: 0, right: 0, height: '2px', background: 'var(--primary)',
                boxShadow: '0 -2px 10px var(--primary)'
            }} />}
        </Link>
    )
}
