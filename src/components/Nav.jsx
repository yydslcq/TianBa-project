import { navLinks } from '../data/siteContent.js';
import { assetPath } from '../utils/assetPath.js';

export default function Nav() {
  return (
    <nav className="nav" aria-label="主导航">
      <a className="brand" href="#home" aria-label="返回首页">
        <img src={assetPath('https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618440495374336.png')} alt="山海" decoding="async" fetchPriority="high" />
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
