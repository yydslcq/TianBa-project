import FadeContent from '../components/FadeContent.jsx';

const artifactItems = [
  { src: '/assets/company-artifacts/artifact-01.png', className: 'a01', alt: '刘贺玉印文物图' },
  { src: '/assets/company-artifacts/artifact-02.png', className: 'a02', alt: '青金石文物图' },
  { src: '/assets/company-artifacts/artifact-03.png', className: 'a03', alt: 'T形帛画文物图' },
  { src: '/assets/company-artifacts/artifact-04.png', className: 'a04', alt: '佛像文物图' },
  { src: '/assets/company-artifacts/artifact-05.png', className: 'a05', alt: '狻猊文物图' },
  { src: '/assets/company-artifacts/artifact-06.png', className: 'a06', alt: '猪尊文物图' },
  { src: '/assets/company-artifacts/artifact-07.png', className: 'a07', alt: '皿方罍文物图' },
  { src: '/assets/company-artifacts/artifact-08.png', className: 'a08', alt: '竖琴乐俑文物图' },
  { src: '/assets/company-artifacts/artifact-09.png', className: 'a09', alt: '竖琴乐俑文物图' },
  { src: '/assets/company-artifacts/artifact-10.png', className: 'a10', alt: '金杯文物图' },
  { src: '/assets/company-artifacts/artifact-11.png', className: 'a11', alt: '金饰牌文物图' },
  { src: '/assets/company-artifacts/artifact-12.png', className: 'a12', alt: '铜奔马文物图' },
  { src: '/assets/company-artifacts/artifact-13.png', className: 'a13', alt: '陶单耳杯文物图' },
  { src: '/assets/company-artifacts/artifact-14.png', className: 'a14', alt: '青瓷执壶文物图' },
  { src: '/assets/company-artifacts/artifact-15.png', className: 'a15', alt: '青花矾红荸荠瓶文物图' },
  { src: '/assets/company-artifacts/artifact-16.png', className: 'a16', alt: '骑马俑文物图' },
];

const businessItems = [
  '采集重建',
  '资产治理',
  '平台应用',
  '运营服务',
];

export default function Company() {
  const handleCardPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  const handleCardPointerLeave = (event) => {
    event.currentTarget.style.setProperty('--mx', '50%');
    event.currentTarget.style.setProperty('--my', '20%');
  };

  return (
    <section className="about company-immersive" id="company">
      <div className="company-bg" aria-hidden="true" />
      <div className="company-veil" aria-hidden="true" />
      <div className="company-particles" aria-hidden="true" />

      <div className="artifact-cloud" aria-hidden="true">
        {artifactItems.map((item, index) => (
          <span
            className={`artifact-item ${item.className}`}
            key={item.src}
            style={{ '--artifact-delay': `-${index * 680}ms` }}
          >
            <img src={item.src} alt="" />
          </span>
        ))}
      </div>

      <div className="site-shell company-immersive-shell">
        <div className="company-stage" aria-label="公司介绍">
          <div className="company-title-wrap">
            <h2 className="company-title">
              文物<span className="company-title-cyan">数字化</span>保护与<span className="company-title-gold">活化利用</span>的<span className="company-title-cyan">领航者</span>
            </h2>
          </div>

          <FadeContent className="company-business-cards" duration={900} delay={540}>
            {businessItems.map((item, index) => (
              <article
                className="company-business-card"
                key={item}
                style={{
                  '--card-delay': `${index * 110}ms`,
                  '--float-delay': `${index * -900}ms`,
                }}
                tabIndex="0"
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
              >
                <h3>{item}</h3>
              </article>
            ))}
          </FadeContent>
        </div>
      </div>
    </section>
  );
}
