-- CreateTable
CREATE TABLE "TeamPermission" (
    "teamId" TEXT NOT NULL,
    "adminCanAllocateRoles" BOOLEAN NOT NULL DEFAULT false,
    "adminCanAllocateMembers" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TeamPermission_pkey" PRIMARY KEY ("teamId")
);

-- AddForeignKey
ALTER TABLE "TeamPermission" ADD CONSTRAINT "TeamPermission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
