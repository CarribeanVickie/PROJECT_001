const { spawnSync } = require('child_process');

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
}

// Make sure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Exiting.');
  process.exit(1);
}

// Run Prisma migrations
if (process.env.SKIP_DB_MIGRATE_ON_BOOT !== '1') {
  console.log('Running Prisma migrate deploy...');
  run('npx', ['prisma', 'migrate', 'deploy']);
} else {
  console.log('Skipping prisma migrate deploy because SKIP_DB_MIGRATE_ON_BOOT=1');
}

// Start the server
console.log('Starting server...');
run('node', ['dist/middleware/server.js']);