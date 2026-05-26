import Reveal from '../components/Reveal.jsx';
import { caseCards, platformScreens } from '../data/siteContent.js';

export default function PlatformCases() {
  return (
    <section className="platform-cases" id="cases">
      <section className="equipment-evidence" aria-labelledby="equipment-title">
        <div className="video-background">
          <video autoPlay loop muted playsInline src="/home-required-assets/一体机视频.mp4" poster="/home-required-assets/一体机视频-frames/frame-03.jpg" />
        </div>
        <div className="site-shell equipment-grid">
          <Reveal className="equipment-copy">
            <p className="section-kicker">Equipment Evidence</p>
            <h2 id="equipment-title">把采集设备和现场流程放出来，让能力自己说话</h2>
            <p>不把设备证明做成孤立视频卡片，而是展示设备、流程、现场与结果之间的关系。</p>
          </Reveal>
          <Reveal className="equipment-video-card">
            <video autoPlay loop muted playsInline controls src="/home-required-assets/一体机视频.mp4" poster="/home-required-assets/一体机视频-frames/frame-03.jpg" />
          </Reveal>
        </div>
      </section>

      <section className="shanhai-platform" aria-labelledby="platform-title">
        <div className="site-shell platform-grid">
          <Reveal className="platform-copy">
            <p className="section-kicker">Shanhai Platform</p>
            <h2 id="platform-title">山海平台：承接文物数字资源管理、应用与可信流通</h2>
            <p>平台不是虚构界面，而是承接采集数据、资产治理、应用发布、授权流通和持续运营的工作台。</p>
            <div className="platform-bullets">
              <span>采集成果入库</span>
              <span>数字档案管理</span>
              <span>应用发布与运营</span>
              <span>授权流通留痕</span>
            </div>
          </Reveal>
          <Reveal className="platform-screen-grid">
            {platformScreens.map((item) => (
              <figure key={item.label}>
                <img src={item.image} alt={item.label} />
                <figcaption>{item.label}</figcaption>
              </figure>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="cases-section">
        <div className="site-shell">
          <Reveal className="section-head centered">
            <p className="section-kicker">Cases</p>
            <h2>按能力证明组织案例，而不是项目罗列</h2>
            <p>每个案例说明它证明了哪一类能力，方便客户快速判断适配度。</p>
          </Reveal>
          <Reveal className="case-grid">
            {caseCards.map((item) => (
              <article key={item.title} className="case-card">
                <figure>
                  <img src={item.image} alt={item.title} />
                </figure>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
            <article className="case-card video-case">
              <figure>
                <video src="/home-required-assets/案例-数字人录屏.mp4" muted loop playsInline controls preload="metadata" />
              </figure>
              <div>
                <h3>山海数字人</h3>
                <p>证明文物内容传播和互动讲解能力。</p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>
    </section>
  );
}
