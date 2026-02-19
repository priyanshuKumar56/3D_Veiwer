/**
 * Navbar — Fixed top navigation bar for the landing page.
 */
export default function Navbar({ onOpenViewer }) {
  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="nav-dot"><span /></div>
        <span className="nav-title">Fabric OS</span>
      </div>
      <ul className="nav-links">
        <li><a href="#">Manifesto</a></li>
        <li><button onClick={onOpenViewer}>Engine</button></li>
        <li><a href="#">Pricing</a></li>
      </ul>
      <span className="nav-badge">V.2.0.4‑BETA</span>
    </nav>
  );
}
