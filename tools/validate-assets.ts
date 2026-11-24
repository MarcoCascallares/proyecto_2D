// Validador de recursos visuales (documento técnico, sección 6.6).
//
// Uso:
//   npm run validate-assets                                  → revisa todo assets/final
//   npm run validate-assets -- assets/final/protagonist.json → revisa un manifiesto
//   npm run validate-assets -- assets/final --attacks src/data/attacks.json
//
// Un manifiesto es un .json con la clave "sheet". La hoja PNG se busca junto a él.
// Código de salida: 0 si no hay errores (los avisos no cuentan), 1 si hay errores.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import process from 'node:process';
import { parseAttackTimings, parseManifest, validateAttackTimings, validateSheet } from '../src/logic/assets/AssetValidator';
import type { AttackTimings, Issue, Owner } from '../src/logic/assets/AssetValidator';
import { decodePng } from './png';

const OWNER_TEXT: Record<Owner, string> = {
  gemini: 'corrige el recurso (Gemini)',
  claude: 'corrige la lógica o los datos (Claude)',
  ambos: 'Gemini ajusta el recurso o Claude ajusta los datos',
};

function usage(): void {
  console.log('Uso: npm run validate-assets -- [ruta ...] [--attacks archivo.json]');
  console.log('  ruta     manifiesto .json o carpeta con manifiestos (por defecto assets/final)');
  console.log('  --attacks  tiempos de impacto de los ataques, para comprobar la sincronización');
}

function findJson(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) findJson(path, found);
    else if (entry.toLowerCase().endsWith('.json')) found.push(path);
  }
  return found;
}

function readJson(path: string): { value: unknown; error: string | null } {
  try {
    return { value: JSON.parse(readFileSync(path, 'utf-8')), error: null };
  } catch (e) {
    return { value: null, error: (e as Error).message };
  }
}

function looksLikeManifest(path: string): boolean {
  const { value } = readJson(path);
  return typeof value === 'object' && value !== null && 'sheet' in value;
}

function print(issues: Issue[]): void {
  if (issues.length === 0) {
    console.log('  OK  sin problemas');
    return;
  }
  for (const i of issues) {
    const label = i.severity === 'error' ? 'ERROR' : 'AVISO';
    console.log(`  ${label}  [${i.code}] ${i.message}`);
    if (i.severity === 'error') console.log(`         → ${OWNER_TEXT[i.owner]}`);
  }
}

function main(argv: string[]): number {
  const paths: string[] = [];
  let attacksPath: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      usage();
      return 0;
    }
    if (arg === '--attacks') {
      attacksPath = argv[++i] ?? null;
      if (!attacksPath) {
        console.error('Falta la ruta del archivo después de --attacks.');
        return 2;
      }
    } else {
      paths.push(arg);
    }
  }

  const usingDefault = paths.length === 0;
  if (usingDefault) paths.push(join('assets', 'final'));

  // Tiempos de ataque (opcional).
  let timings: AttackTimings | null = null;
  let totalErrors = 0;
  let totalWarnings = 0;
  if (attacksPath) {
    console.log(`Tiempos de ataque: ${attacksPath}`);
    const { value, error } = readJson(attacksPath);
    if (error) {
      console.log(`  ERROR  No se pudo leer el archivo: ${error}`);
      return 1;
    }
    const parsed = parseAttackTimings(value);
    print(parsed.issues);
    totalErrors += parsed.issues.filter((i) => i.severity === 'error').length;
    timings = parsed.timings;
    console.log('');
  }

  // Manifiestos a revisar.
  const manifests: string[] = [];
  for (const path of paths) {
    if (!existsSync(path)) {
      if (usingDefault) {
        console.log('Todavía no hay recursos finales en assets/final. Nada que validar.');
        return 0;
      }
      console.error(`No existe la ruta: ${path}`);
      return 2;
    }
    if (statSync(path).isDirectory()) {
      manifests.push(...findJson(path).filter(looksLikeManifest));
    } else {
      manifests.push(path);
    }
  }
  if (manifests.length === 0) {
    console.log('No se encontraron manifiestos (.json con la clave "sheet"). Nada que validar.');
    return 0;
  }

  for (const manifestPath of manifests) {
    console.log(relative(process.cwd(), manifestPath) || manifestPath);
    const issues: Issue[] = [];

    const { value, error } = readJson(manifestPath);
    if (error) {
      issues.push({ severity: 'error', owner: 'gemini', code: 'JSON', message: `El manifiesto no es un JSON válido: ${error}` });
    } else {
      const parsed = parseManifest(value);
      issues.push(...parsed.issues);
      if (parsed.manifest) {
        const sheetPath = join(dirname(manifestPath), parsed.manifest.sheet);
        if (!existsSync(sheetPath)) {
          issues.push({ severity: 'error', owner: 'gemini', code: 'SHEET_MISSING', message: `No se encuentra la hoja "${parsed.manifest.sheet}" junto al manifiesto.` });
        } else {
          try {
            const image = decodePng(new Uint8Array(readFileSync(sheetPath)));
            issues.push(...validateSheet(parsed.manifest, image));
            if (timings) issues.push(...validateAttackTimings(parsed.manifest, timings));
          } catch (e) {
            issues.push({ severity: 'error', owner: 'gemini', code: 'PNG', message: (e as Error).message });
          }
        }
      }
    }

    print(issues);
    totalErrors += issues.filter((i) => i.severity === 'error').length;
    totalWarnings += issues.filter((i) => i.severity === 'warning').length;
    console.log('');
  }

  console.log(`Resumen: ${manifests.length} hoja(s), ${totalErrors} error(es), ${totalWarnings} aviso(s).`);
  console.log(totalErrors === 0 ? 'Se puede integrar.' : 'No se integra hasta corregir los errores.');
  return totalErrors === 0 ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
