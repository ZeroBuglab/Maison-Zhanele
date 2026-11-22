import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://build:build@127.0.0.1:5432/build?schema=public'
};
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Vercel runs this script with the real Neon DATABASE_URL. Apply only committed
// migrations before compiling, so a successful deployment cannot start without
// the tables expected by the Prisma client. The placeholder URL is build-only
// and must never be used for migrations.
const shouldSeedInitialData = Boolean(process.env.SEED_ADMIN_EMAIL?.trim())
  && Boolean(process.env.SEED_ADMIN_PASSWORD);

const steps = [
  ['exec', 'prisma', 'generate'],
  ...(process.env.DATABASE_URL
    ? [['exec', 'prisma', 'migrate', 'deploy']]
    : []),
  ...(shouldSeedInitialData ? [['run', 'db:seed']] : []),
  ['exec', 'next', 'build']
];

for (const args of steps) {
  if (args.includes('migrate')) console.log('[build] Applying Prisma migrations to Neon...');
  if (args.includes('db:seed')) console.log('[build] Seeding the initial production catalog and administrator...');
  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : npm;
  const commandArgs = process.platform === 'win32' ? ['/d', '/s', '/c', `${npm} ${args.join(' ')}`] : args;
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
