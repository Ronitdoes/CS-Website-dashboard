import postgres from 'postgres';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const raw = trimmed.slice(eqIdx + 1).trim();
  process.env[key] = raw.replace(/^"(.*)"$/, '$1');
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

console.log('Creating tables...');

await sql`
  CREATE TABLE IF NOT EXISTS homepage_gallery_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(255) NOT NULL,
    caption       TEXT,
    image_url     TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;
console.log(' homepage_gallery_items');

await sql`
  CREATE TABLE IF NOT EXISTS homepage_hero (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    heading              TEXT NOT NULL,
    subheading           TEXT NOT NULL,
    description          TEXT NOT NULL,
    cta_text             VARCHAR(100) NOT NULL,
    cta_link             TEXT NOT NULL,
    background_image_url TEXT NOT NULL,
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;
console.log(' homepage_hero');

await sql`
  CREATE TABLE IF NOT EXISTS homepage_hero_images (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hero_id       UUID NOT NULL REFERENCES homepage_hero(id) ON DELETE CASCADE,
    image_url     TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
  )
`;
console.log(' homepage_hero_images');

await sql`
  CREATE TABLE IF NOT EXISTS events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    description   TEXT NOT NULL,
    cover_image   TEXT NOT NULL,
    event_date    TIMESTAMP NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    featured      BOOLEAN NOT NULL DEFAULT FALSE,
    status        VARCHAR(50) NOT NULL DEFAULT 'draft',
    tag           VARCHAR(100) NOT NULL DEFAULT 'Workshop',
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;
console.log(' events');

await sql`
  CREATE TABLE IF NOT EXISTS team_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    role          VARCHAR(255) NOT NULL,
    image_url     TEXT NOT NULL,
    "group"       VARCHAR(50) NOT NULL DEFAULT 'core',
    linkedin_url  TEXT,
    instagram_url TEXT,
    github_url    TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;
console.log('team_members');

await sql`
  CREATE TABLE IF NOT EXISTS hackx_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    role          VARCHAR(255) NOT NULL,
    image_url     TEXT NOT NULL,
    "group"       VARCHAR(50) NOT NULL DEFAULT 'core',
    year          VARCHAR(10) NOT NULL DEFAULT '2026',
    email         VARCHAR(255),
    linkedin_url  TEXT,
    instagram_url TEXT,
    github_url    TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;
await sql`ALTER TABLE hackx_members ADD COLUMN IF NOT EXISTS year VARCHAR(10) NOT NULL DEFAULT '2026';`;
console.log('hackx_members');

await sql`CREATE INDEX IF NOT EXISTS gallery_active_order_idx ON homepage_gallery_items (is_active, display_order)`;
await sql`CREATE INDEX IF NOT EXISTS hero_images_hero_id_idx  ON homepage_hero_images (hero_id)`;
await sql`CREATE INDEX IF NOT EXISTS hero_images_order_idx    ON homepage_hero_images (display_order)`;
await sql`CREATE INDEX IF NOT EXISTS events_status_order_idx  ON events (status, display_order)`;
await sql`CREATE INDEX IF NOT EXISTS events_featured_idx      ON events (featured)`;
await sql`CREATE INDEX IF NOT EXISTS team_group_order_idx     ON team_members ("group", display_order)`;
await sql`CREATE INDEX IF NOT EXISTS team_active_idx          ON team_members (is_active)`;
await sql`CREATE INDEX IF NOT EXISTS hackx_group_order_idx    ON hackx_members ("group", display_order)`;
await sql`CREATE INDEX IF NOT EXISTS hackx_year_group_idx     ON hackx_members (year, "group", display_order)`;
await sql`CREATE INDEX IF NOT EXISTS hackx_active_idx         ON hackx_members (is_active)`;
console.log('✓ indexes');

await sql.end();
console.log('\nAll tables created successfully!');

