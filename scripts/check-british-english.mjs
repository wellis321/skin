#!/usr/bin/env node
/**
 * Fails if US spellings are found in src/ or static/.
 * British English only (e.g. organisation, colour, personalised).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const US_SPELLINGS = [
	'organization',
	'organizations',
	'color',
	'colors',
	'behavior',
	'behaviors',
	'personalized',
	'optimize',
	'optimized',
	// 'center' / 'centers' omitted: used in CSS/Tailwind (text-center, justify-center)
	'analyze',
	'analyzed',
	'analyzing',
	'license', // noun: US; UK = licence for noun
	'favor',
	'favors',
	'honor',
	'honors',
	'neighbor',
	'neighbors',
	'customize',
	'customized',
	'recognize',
	'realize',
	'realized',
	'finalize',
	'finalized'
];

const WORD_BOUNDARY = (word) => {
	const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`\\b${escaped}\\b`, 'gi');
};

function walk(dir, ext, files = []) {
	for (const dirent of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, dirent.name);
		if (dirent.isDirectory()) {
			if (dirent.name !== 'node_modules' && dirent.name !== '.svelte-kit' && dirent.name !== 'build')
				walk(full, ext, files);
		} else if (ext.some((e) => dirent.name.endsWith(e))) {
			files.push(full);
		}
	}
	return files;
}

const root = join(process.cwd(), 'src');
const staticRoot = join(process.cwd(), 'static');
const exts = ['.svelte', '.ts', '.js', '.json', '.html', '.css', '.md', '.txt'];
const files = [...walk(root, exts), ...(staticRoot ? walk(staticRoot, exts) : [])];

let failed = false;
for (const file of files) {
	const content = readFileSync(file, 'utf8');
	for (const word of US_SPELLINGS) {
		const re = WORD_BOUNDARY(word.trim());
		let m;
		let hasBadMatch = false;
		while ((m = re.exec(content)) !== null) {
			// Allow "color" when it is the CSS property name (color: value)
			if (word.trim() === 'color' && /color\s*:/.test(content.slice(m.index, m.index + 20)))
				continue;
			hasBadMatch = true;
			break;
		}
		if (hasBadMatch) {
			console.error(`${file}: avoid US spelling "${word.trim()}" (use British English)`);
			failed = true;
		}
	}
}

if (failed) process.exit(1);
