'use client';

export default function FloatingCartButton({ itemCount }) {
  const handleClick = () => {
    const section = document.getElementById('tu-solicitud');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!itemCount || itemCount === 0) return null;

  return (
    <button onClick={handleClick} style={styles.button} aria-label="Ver solicitud">
      🛒
      <span style={styles.badge}>{itemCount}</span>
    </button>
  );
}

const styles = {
  button: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#111',
    color: '#fff',
    fontSize: '24px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 999,
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#ff3b30',
    color: '#fff',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
};