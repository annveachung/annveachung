-- Drop the unused Experience and Education tables. Their admin editors
-- were dead UI: the homepage Education/Experience columns are driven by
-- SkillTreeNode.category, never these tables.

-- DropTable
DROP TABLE "Experience";

-- DropTable
DROP TABLE "Education";
