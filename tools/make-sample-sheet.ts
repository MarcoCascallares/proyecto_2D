// Genera una hoja de muestra válida en assets/samples/ para probar el validador:
//   npm run make-sample
//   npm run validate-assets -- assets/samples --attacks assets/samples/attacks.json

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { encodePng } from './png';
import { buildSample } from './sample-data';

const dir = join(process.cwd(), 'assets', 'samples');
mkdirSync(dir, { recursive: true });

const { image, manifest, attacks } = buildSample();
writeFileSync(join(dir, manifest.sheet), encodePng(image));
writeFileSync(join(dir, 'protagonist_sample.json'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(join(dir, 'attacks.json'), JSON.stringify(attacks, null, 2) + '\n');

console.log(`Muestra creada en ${dir}:`);
console.log('  protagonist_sample.png, protagonist_sample.json, attacks.json');
console.log('Probala con: npm run validate-assets -- assets/samples --attacks assets/samples/attacks.json');
