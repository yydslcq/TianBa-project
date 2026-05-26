import Reveal from '../components/Reveal.jsx';
import { businessCards, companyPoints } from '../data/siteContent.js';

export default function Company() {
  return (
    <section className="about about-clean" id="company">
      <div className="site-shell about-clean-shell">
        <Reveal className="clean-heading">
          <span>公司介绍</span>
          <div className="clean-titlemark">
            <img src="/assets/company-logo-symbol.png" alt="芒果数智品牌图形" />
            <h2>湖南芒果数智艺术科技有限责任公司</h2>
          </div>
          <p>依托湖南广电体系打造的文化艺术科技企业，面向博物馆、文旅单位与文化科技项目，提供文物数字化、文物数字资产管理、平台运营与数据咨询服务。</p>
        </Reveal>

        <Reveal className="clean-intro">
          <div className="clean-abstract-card image-card" aria-hidden="true">
            <img src="/assets/company-intro-main-transparent.png" alt="" />
          </div>
          <div className="clean-points" aria-label="公司核心定位">
            {companyPoints.map((point) => {
              const [lead, rest] = point.split('，');
              return (
                <p key={point}>
                  <b>{lead}</b>，{rest}
                </p>
              );
            })}
          </div>
        </Reveal>

        <Reveal as="p" className="clean-statement">主营业务</Reveal>

        <Reveal className="business-grid" aria-label="主营业务">
          {businessCards.map((card) => (
            <article key={card.title} tabIndex="0">
              <figure>
                <img src={card.image} alt={card.title} />
              </figure>
              <div>
                <b>{card.title}</b>
                <span>{card.desc}</span>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
