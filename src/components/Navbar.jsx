import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ padding: '20px', background: '#eee' }}>
      <ul style={{listStyle: 'none', display: 'flex', gap: '15px'}}>
        <li><Link to="/description">Description</Link></li>
        <li><Link to="/logbook">Logbook</Link></li>
        <li><Link to="/flow">Flow</Link></li>
        <li><Link to="/mockup">Mockup</Link></li>
        <li><Link to="/model">Model</Link></li>
        <li><Link to="/game">Play Game</Link></li>
        <li><Link to="/rules">Rules</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
