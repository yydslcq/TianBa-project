import { navLinks } from '../data/siteContent.js';
import { assetPath } from '../utils/assetPath.js';

export default function Nav() {
  return (
    <nav className="nav" aria-label="主导航">
      <a className="brand" href="#home" aria-label="返回首页">
        <img src={assetPath('/assets/shanhai-logo-white.png')} alt="山海" />
      </a>
      <div className="nav-links">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
      <a className="nav-cta" href="#contact">
        咨询方案
      </a>
    </nav>
  );
}
