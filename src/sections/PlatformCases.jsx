import { useState } from 'react';
import Reveal from '../components/Reveal.jsx';
import { platformShowcases } from '../data/siteContent.js';
import { assetPath } from '../utils/assetPath.js';

export default function PlatformCases() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeShowcase = platformShowcases[activeIndex];

  return (
    <section className="platform-cases" id="platform">
      <section className="shanhai-platform" aria-labelledby="platform-title">
        <div className="platform-showcase-bg" aria-hidden="true">
          <img key={activeShowcase.image} src={assetPath(activeShowcase.image)} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="platform-showcase-scrim" aria-hidden="true" />

        <div className="site-shell platform-showcase-layout">
          <Reveal className="platform-showcase-copy">
            <h2 id="platform-title">山海平台</h2>
            <p>文物数字化全链路解决方案</p>
            <div className="platform-showcase-tabs" role="tablist" aria-label="山海平台能力">
              {platformShowcases.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === index}
                  className={activeIndex === index ? 'is-active' : ''}
                  onClick={() => setActiveIndex(index)}
                >
                  <span>{item.no}</span>
                  {item.title}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal className="platform-active-copy" aria-live="polite">
            <h3>{activeShowcase.title}</h3>
            <p>{activeShowcase.desc}</p>
          </Reveal>
        </div>
      </section>
    </section>
  );
}
