import Reveal from '../components/Reveal.jsx';
import { heroStats } from '../data/siteContent.js';
import { assetPath } from '../utils/assetPath.js';

export default function Hero() {
  return (
    <header className="hero" id="home">
      <div className="hero-media" aria-hidden="true">
        <video autoPlay muted loop playsInline preload="auto">
          <source src={assetPath('https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618438703448064.mp4')} type="video/mp4" />
        </video>
      </div>
      <div className="site-shell hero-grid">
        <Reveal className="hero-main">
          <h1>
            <span className="line">
              让文物<span className="accent">高质量</span>
            </span>
            <span className="line">进入数字世界</span>
          </h1>
          <p className="hero-copy">围绕文物数据全生命周期，提供从高质量数字化、数据治理、资产管理，到平台应用与持续运营的一体化能力。</p>
          <div className="hero-actions">
            <a className="btn dark" href="#platform">解决方案</a>
            <a className="btn light" href="#cases">应用案例</a>
          </div>
        </Reveal>

        <Reveal as="aside" className="hero-evidence" aria-label="能力概览">
          <div className="evidence-row">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </header>
  );
}
