import { useEffect, useRef, useState } from 'react';
import { assetPath } from '../utils/assetPath.js';
import '../styles/tail-cases-cooperation.css';

const CASES = [
  {
    slug: 'river',
    type: '专题传播',
    title: '因为长江',
    description: '沿江文物与城市记忆被重新编织，成为可抵达、可分享的文化叙事。',
    video: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618416289087488.mp4',
    poster: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618423256784896.png',
  },
  {
    slug: 'xinchui',
    type: '沉浸内容',
    title: '辛追夫人晚宴 VR 展',
    description: '从器物、饮食与礼制出发，让汉代生活在一场沉浸式晚宴中复现。',
    splitMedia: {
      poster: {
        src: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618414276780032.png',
        alt: '辛追夫人晚宴 VR 展宣传海报',
      },
      video: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618414436163584.mp4',
    },
  },
  {
    slug: 'kunming',
    type: '公共服务',
    title: '一馆一码',
    description: '以统一入口连接城市文化资源，让在地发现自然进入日常路径。',
    image: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618469821947904.png',
    alt: '一馆一码应用画面',
  },
  {
    slug: 'treasure',
    type: '互动运营',
    title: '山海亲子寻宝',
    description: '把神话线索放进亲子旅程，用探索任务带孩子读懂山海世界。',
    image: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618474339213312.png',
    alt: '山海亲子寻宝体验画面',
  },
  {
    slug: 'silk',
    type: '动态影像',
    title: '丝绸之路——相',
    description: '以流动影像串联跨地域遗产，让文明交流从历史材料成为当代感知。',
    video: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618412166086656.mp4',
    poster: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618411508539392.png',
  },
  {
    slug: 'print',
    type: '实体转化',
    title: '文创打印',
    description: '开放纹样与馆藏图像的再创作路径，让文化资产成为可带走的日常物件。',
    images: [
      { src: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618407774650368.png', alt: '文创打印成品之一' },
      { src: 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618408483487744.png', alt: '文创打印成品之二' },
    ],
  },
];

const COOPERATION_MODES = [
  {
    title: '馆藏数字化合作',
    description: '围绕重点馆藏，完成采集重建、质量验收与数据交付。',
  },
  {
    title: '专题策展合作',
    description: '围绕展览主题，组织数字内容、互动体验与传播应用。',
  },
  {
    title: '平台共建合作',
    description: '结合馆端需求，建设资产管理、应用发布与服务入口。',
  },
  {
    title: '运营共创合作',
    description: '围绕内容更新、公众触达与授权使用，持续拓展场景。',
  },
];

function CaseMedia({ item }) {
  if (item.splitMedia) {
    return (
      <div className="tail-cases-split-media">
        <img src={assetPath(item.splitMedia.poster.src)} alt={item.splitMedia.poster.alt} loading="lazy" decoding="async" />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          data-case-video=""
          aria-label={`${item.title}影像片段`}
        >
          <source src={assetPath(item.splitMedia.video)} type="video/mp4" />
        </video>
      </div>
    );
  }

  if (item.video) {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={assetPath(item.poster)}
        data-case-video=""
        aria-label={`${item.title}影像片段`}
      >
        <source src={assetPath(item.video)} type="video/mp4" />
      </video>
    );
  }

  if (item.images) {
    return item.images.map((image) => <img key={image.src} src={assetPath(image.src)} alt={image.alt} loading="lazy" decoding="async" />);
  }

  return <img src={assetPath(item.image)} alt={item.alt} loading="lazy" decoding="async" />;
}

export default function TailCasesCooperation() {
  const [openCase, setOpenCase] = useState(null);
  const casesSectionRef = useRef(null);

  useEffect(() => {
    const root = casesSectionRef.current;
    if (!root) return undefined;

    const videos = Array.from(root.querySelectorAll('video[data-case-video]'));
    if (videos.length === 0) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visibleVideos = new WeakMap();

    const syncVideoPlayback = (video) => {
      if (reduceMotion.matches || !visibleVideos.get(video)) {
        if (typeof video.pause === 'function') video.pause();
        return;
      }

      if (typeof video.play === 'function') video.play().catch(() => {});
    };

    if (!('IntersectionObserver' in window)) {
      videos.forEach((video) => {
        if (typeof video.pause === 'function') video.pause();
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          visibleVideos.set(video, entry.isIntersecting);
          syncVideoPlayback(video);
        });
      },
      { threshold: 0.35 },
    );

    videos.forEach((video) => {
      visibleVideos.set(video, false);
      observer.observe(video);
    });

    const handleMotionChange = () => {
      videos.forEach(syncVideoPlayback);
    };

    reduceMotion.addEventListener?.('change', handleMotionChange);

    return () => {
      observer.disconnect();
      reduceMotion.removeEventListener?.('change', handleMotionChange);
      videos.forEach((video) => {
        if (typeof video.pause === 'function') video.pause();
      });
    };
  }, []);

  const toggleCase = (slug) => {
    setOpenCase((currentCase) => (currentCase === slug ? null : slug));
  };

  const handleCaseKeyDown = (event, slug) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleCase(slug);
  };

  return (
    <div className="tail-redesign">
      <section className="tail-cases-section" id="cases" ref={casesSectionRef} aria-labelledby="tail-cases-title">
        <div className="tail-cases-shell">
          <header className="tail-cases-heading">
            <h2 className="tail-cases-title" id="tail-cases-title">从数据资产到文化体验</h2>
          </header>

          <div className="tail-cases-gallery" aria-label="文化体验应用案例">
            {CASES.map((item) => (
              <article
                key={item.slug}
                className={`tail-cases-tile tail-cases-tile--${item.slug}${openCase === item.slug ? ' is-open' : ''}`}
                tabIndex="0"
                aria-label={`${item.type}，${item.title}`}
                aria-expanded={openCase === item.slug}
                onClick={() => toggleCase(item.slug)}
                onKeyDown={(event) => handleCaseKeyDown(event, item.slug)}
              >
                <div className={`tail-cases-media${item.images ? ' tail-cases-print-media' : ''}${item.splitMedia ? ' tail-cases-media--split' : ''}`}>
                  <CaseMedia item={item} />
                </div>
                <div className="tail-cases-copy">
                  <p className="tail-cases-type">{item.type}</p>
                  <h3 className="tail-cases-name">{item.title}</h3>
                  <p className="tail-cases-description">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="tail-cooperation-section" id="cooperation" aria-labelledby="tail-cooperation-title">
        <div className="tail-cooperation-shell">
          <header className="tail-cooperation-intro">
            <h2 className="tail-cooperation-title" id="tail-cooperation-title">多种合作方式</h2>
          </header>

          <div className="tail-cooperation-grid">
            {COOPERATION_MODES.map((mode) => (
              <article className="tail-cooperation-item" key={mode.title}>
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
