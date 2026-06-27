-- DropTable
DROP TABLE "Skill";

-- CreateTable
CREATE TABLE "SkillTreeNode" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'skill',
    "period" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "parents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillTreeNode_pkey" PRIMARY KEY ("id")
);

