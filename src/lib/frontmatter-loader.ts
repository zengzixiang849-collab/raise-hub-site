// Minimal content loader: reads every *.md file in a folder and returns its
// YAML front matter as one collection entry (id = file name without .md).
//
// Why not Astro's built-in glob() loader? On this machine the project path
// contains non-ASCII characters, and loading glob() inside content.config.ts
// makes Vite evaluate the CommonJS "yaml" package as ESM ("require is not
// defined"). Loading "yaml" through Node's own require() avoids that.
// Files starting with "_" (templates) are skipped. Body text is not used —
// all content lives in the front matter fields defined in content.config.ts.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const YAML = require('yaml') as { parse: (src: string) => unknown };

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

export function frontmatterLoader(dir: string) {
  return async () => {
    const abs = join(process.cwd(), dir);
    // Fail loudly: a renamed or missing folder must not produce an empty site.
    if (!existsSync(abs)) {
      throw new Error(`Content folder not found: ${dir} (expected at ${abs}). Was it renamed or deleted?`);
    }

    return readdirSync(abs)
      .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
      .sort()
      .map((file) => {
        const raw = readFileSync(join(abs, file), 'utf8').replace(/^\uFEFF/, '');
        const match = raw.match(FRONTMATTER);
        if (!match) {
          throw new Error(`${dir}/${file}: missing front matter (the file must start with --- and a closing ---).`);
        }
        let data: unknown;
        try {
          data = YAML.parse(match[1]) ?? {};
        } catch (error) {
          throw new Error(`${dir}/${file}: invalid YAML front matter — ${(error as Error).message}`);
        }
        if (typeof data !== 'object' || Array.isArray(data)) {
          throw new Error(`${dir}/${file}: front matter must be a set of "field: value" lines.`);
        }
        return { id: basename(file, '.md'), ...(data as Record<string, unknown>) };
      });
  };
}
