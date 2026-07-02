-- Repurpose the two free-text fields on SkillTreeNode for the redesigned
-- education/experience timeline cards: period -> city, description ->
-- organization. Renames preserve existing row data.

ALTER TABLE "SkillTreeNode" RENAME COLUMN "period" TO "city";
ALTER TABLE "SkillTreeNode" RENAME COLUMN "description" TO "organization";
