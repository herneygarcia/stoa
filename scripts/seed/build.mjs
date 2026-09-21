// Convierte el banco curado (scripts/seed/*.mjs) en src/content/casos/banco/*.md
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import matter from 'gray-matter';

const dir = 'src/content/casos/banco';
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
let n = 0;
for (const f of readdirSync('scripts/seed').filter((f) => f.endsWith('.mjs') && f !== 'build.mjs')) {
  const casos = (await import(`./${f}`)).default;
  for (const { slug, ...data } of casos) {
    writeFileSync(`${dir}/${data.ambito}-${slug}.md`, matter.stringify('', { ...data, origen: 'curado' }));
    n++;
  }
}
console.log(`${n} casos escritos en ${dir}`);
