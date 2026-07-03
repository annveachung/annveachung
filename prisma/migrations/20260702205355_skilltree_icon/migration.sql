-- Add an uploaded-icon URL for skill nodes (shown inside the skill orbs).
ALTER TABLE "SkillTreeNode" ADD COLUMN "icon" TEXT NOT NULL DEFAULT '';
