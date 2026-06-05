import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => readFileSync(join(root, file), 'utf8');

const app = read('src/App.jsx');
const hero = read('src/sections/Hero.jsx');
const siteContent = read('src/data/siteContent.js');

const assertions = [
  {
    name: 'App keeps Solution behind the soft-offline flag',
    pass: app.includes('const SHOW_SOLUTION_SECTION = false;')
      && app.includes('{SHOW_SOLUTION_SECTION ? <Solution /> : null}'),
  },
  {
    name: 'nav solution entry now targets platform section',
    pass: siteContent.includes("{ href: '#platform', label: '解决方案' }"),
  },
  {
    name: 'hero solution CTA now targets platform section',
    pass: hero.includes('<a className="btn dark" href="#platform">解决方案</a>'),
  },
];

const failures = assertions.filter((assertion) => !assertion.pass);

if (failures.length > 0) {
  console.error('Solution soft-offline checks failed:');
  for (const failure of failures) {
    console.error(`- ${failure.name}`);
  }
  process.exit(1);
}

console.log('Solution soft-offline checks passed.');
