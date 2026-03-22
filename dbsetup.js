const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const appRoot = __dirname;
const dataDir = process.env.DATA_DIR || '/data';
const prismaDir = path.join(appRoot, 'prisma');
const localDbPath = path.join(prismaDir, 'dev.db');
const volumeDbPath = path.join(dataDir, 'dev.db');
const localUploadsDir = path.join(appRoot, 'uploads');
const volumeUploadsDir = path.join(dataDir, 'uploads');

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function copyIfMissing(source, destination) {
  if (!fs.existsSync(destination) && fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    cwd: appRoot,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

ensureDir(dataDir);
ensureDir(prismaDir);
ensureDir(volumeUploadsDir);

copyIfMissing(localDbPath, volumeDbPath);

process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${volumeDbPath}`;
process.env.UPLOADS_DIR = process.env.UPLOADS_DIR || volumeUploadsDir;

if (!fs.existsSync(localUploadsDir)) {
  fs.symlinkSync(
    volumeUploadsDir,
    localUploadsDir,
    process.platform === 'win32' ? 'junction' : 'dir',
  );
}

if (process.env.SKIP_DB_MIGRATE_ON_BOOT !== '1') {
  run('npx', ['prisma', 'migrate', 'deploy']);
} else {
  console.log('Skipping prisma migrate deploy because SKIP_DB_MIGRATE_ON_BOOT=1');
}

const [, , command, ...args] = process.argv;
if (!command) {
  console.error('No app command provided to dbsetup.js');
  process.exit(1);
}

const child = spawnSync(command, args, {
  stdio: 'inherit',
  env: process.env,
  cwd: appRoot,
});

process.exit(child.status || 0);
