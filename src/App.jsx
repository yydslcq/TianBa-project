import Nav from './components/Nav.jsx';
import Hero from './sections/Hero.jsx';
import Company from './sections/Company.jsx';
import Solution from './sections/Solution.jsx';
import DeviceDashboard from './sections/DeviceDashboard.jsx';
import PlatformCases from './sections/PlatformCases.jsx';
import ExperienceModule from './sections/ExperienceModule.jsx';
import CooperationContact from './sections/CooperationContact.jsx';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Company />
        <Solution />
        <DeviceDashboard />
        <PlatformCases />
        <ExperienceModule />
        <CooperationContact />
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
