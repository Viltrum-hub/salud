import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
const root = process.cwd();
const output = join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of await readdir(root)) {
  if (file.endsWith('.html') || file === '.nojekyll') await cp(join(root, file), join(output, file));
}
await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });
console.log('Static website built in dist/');
