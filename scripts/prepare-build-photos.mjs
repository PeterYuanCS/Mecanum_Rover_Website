import { mkdir, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

// Usage: node scripts/prepare-build-photos.mjs /path/to/originals
// ImageMagick with HEIC/AVIF support is required. Originals are never modified.
const source = process.argv[2];
if (!source) throw new Error('Pass the directory containing the numbered HEIC photographs.');
const destination = resolve('public/images/build');
await mkdir(destination, { recursive: true });
const counts = [2, 4, 6, 5, 4, 7];
const ids = counts.flatMap((count, stage) => Array.from({ length: count }, (_, photo) => `${stage + 1}${photo ? `.${photo}` : ''}`));
const run = (args) => new Promise((accept, reject) => {
  const child = spawn('magick', args, { stdio: 'inherit' });
  child.on('error', reject);
  child.on('exit', (code) => code === 0 ? accept() : reject(new Error(`ImageMagick exited with ${code}`)));
});
let originalBytes = 0;
let outputBytes = 0;
// Two workers keep the AVIF encoder's memory and CPU use bounded.
const queue = [...ids];
await Promise.all(Array.from({ length: 2 }, async () => {
  for (let id; (id = queue.shift());) {
    const input = resolve(source, `${id}.HEIC`);
    originalBytes += (await stat(input)).size;
    for (const [suffix, size, quality] of [['', 1600, 48], ['-thumb', 240, 40], ...(!id.includes('.') ? [['-cover', 960, 46]] : [])]) {
      const output = resolve(destination, `${id}${suffix}.avif`);
      await run([input, '-auto-orient', '-resize', `${size}x${size}>`, '-strip', '-define', 'heic:speed=6', '-quality', String(quality), output]);
      outputBytes += (await stat(output)).size;
    }
    console.log(`Prepared ${id}`);
  }
}));
console.log(`${ids.length} photos: ${(originalBytes / 1048576).toFixed(2)} MiB originals → ${(outputBytes / 1048576).toFixed(2)} MiB including covers and thumbnails.`);
