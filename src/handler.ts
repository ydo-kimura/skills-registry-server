import { existsSync, readdirSync, readFileSync, watch } from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { LRUCache } from 'lru-cache';
import { join } from 'path';
import { parse } from 'yaml';

const UPSTREAM_API = 'https://skills.sh';
// Use process.cwd() to locate registry directory reliably
const REGISTRY_DIR = join(process.cwd(), 'registry');
const upstreamCache = new LRUCache<string, Skill[]>({
  max: 500,
  ttl: 1000 * 60 * 5,
});

interface SkillMetadata {
  author?: string;
  version?: string;
  [key: string]: any;
}

interface Skill {
  name: string;
  description: string;
  source?: string;
  license?: string;
  metadata?: SkillMetadata;
  [key: string]: any;
}

interface SearchResponse {
  skills: Skill[];
}

export const getPrivateSkills = (): Skill[] => {
  const skills: Skill[] = [];

  if (!existsSync(REGISTRY_DIR)) {
    return skills;
  }

  try {
    const files = readdirSync(REGISTRY_DIR);

    for (const file of files) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;

      const filePath = join(REGISTRY_DIR, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const parsed = parse(content);

        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item && item.name) {
              skills.push(item as Skill);
            }
          });
        } else if (parsed && typeof parsed === 'object') {
          if (parsed.name) {
            skills.push(parsed as Skill);
          }
        }
      } catch (err) {
        console.error(`Error parsing skill file ${file}:`, err);
      }
    }
  } catch (error) {
    console.error('Error reading skills directory:', error);
  }

  return skills;
};

let CACHED_PRIVATE_SKILLS = getPrivateSkills();

if (existsSync(REGISTRY_DIR)) {
  console.log(`Watching for changes in ${REGISTRY_DIR}`);
  let debounceTimer: NodeJS.Timeout;

  watch(REGISTRY_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.yaml') || filename.endsWith('.yml') || eventType === 'rename')) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log('Reloading skills...');
        CACHED_PRIVATE_SKILLS = getPrivateSkills();
        console.log(`Reloaded ${CACHED_PRIVATE_SKILLS.length} skills.`);
      }, 1000);
    }
  });
} else {
  console.warn(`Registry directory ${REGISTRY_DIR} not found. access /api/search will return empty list.`);
}

export const searchHandler = async (
  req: IncomingMessage | { url?: string; headers: any },
  res: ServerResponse | any,
) => {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '', `http://${host}`);
  const query = url.searchParams.get('q')?.toLowerCase() || '';
  const limit = url.searchParams.get('limit') || '10';

  const privateSkills = CACHED_PRIVATE_SKILLS;
  const matchedPrivateSkills = privateSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query)),
  );

  let upstreamSkills: Skill[] = [];
  const cacheKey = `upstream:${query}:${limit}`;
  const cached = upstreamCache.get(cacheKey);

  if (cached) {
    upstreamSkills = cached;
  } else {
    try {
      const upstreamUrl = `${UPSTREAM_API}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await fetch(upstreamUrl);
      if (response.ok) {
        const data = (await response.json()) as SearchResponse;
        upstreamSkills = data.skills || [];
        upstreamCache.set(cacheKey, upstreamSkills);
      }
    } catch (error) {
      console.error('Error fetching upstream skills:', error);
    }
  }

  const privateNames = new Set(matchedPrivateSkills.map((s) => s.name));
  const uniqueUpstreamSkills = upstreamSkills.filter((s) => !privateNames.has(s.name));
  const mergedSkills = [...matchedPrivateSkills, ...uniqueUpstreamSkills];

  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }

  if (res.status) {
    // Vercel / Express style
    res.status(200).json({ skills: mergedSkills });
  } else {
    // Node.js http style
    res.writeHead(200);
    res.end(JSON.stringify({ skills: mergedSkills }));
  }
};
