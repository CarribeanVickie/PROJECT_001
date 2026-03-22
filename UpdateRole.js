// updateRole.js
const { PrismaClient } = require('@prisma/client'); // <-- use require

const prisma = new PrismaClient();

async function main() {
  const email = 'ichuguvictor@gmail.com'; // the user's email
  const newRole = 'SUPER_ADMIN';          // the role you want

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: newRole },
  });

  console.log('User role updated:', updatedUser);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });