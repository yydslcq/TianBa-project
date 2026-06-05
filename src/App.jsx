import { useEffect } from 'react';
import Nav from './components/Nav.jsx';
import Hero from './sections/Hero.jsx';
import Company from './sections/Company.jsx';
import Solution from './sections/Solution.jsx';
import DeviceDashboard from './sections/DeviceDashboard.jsx';
import PlatformCases from './sections/PlatformCases.jsx';
import TailCasesCooperation from './sections/TailCasesCooperation.jsx';
import TailPartnersContact from './sections/TailPartnersContact.jsx';

const SHOW_SOLUTION_SECTION = false;

export default function App() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Company />
        {SHOW_SOLUTION_SECTION ? <Solution /> : null}
        <DeviceDashboard />
        <PlatformCases />
        <TailCasesCooperation />
        <TailPartnersContact />
      </main>
      <footer className="footer">
        <div className="site-shell footer-inner">
          <div>
            Copyright©湖南芒果数智艺术科技有限责任公司 shuziwenbo.cn 版权所有
            <br />
            湘ICP备2024069118号-1 湘公网安备43010502001703
          </div>
          <div>
            <a href="https://omgotv.mgtv.com/protocol/sh_server">隐私条款</a> /{' '}
            <a href="https://omgotv.mgtv.com/protocol/sh_privacy">隐私政策</a>
          </div>
        </div>
      </footer>
    </>
  );
}
