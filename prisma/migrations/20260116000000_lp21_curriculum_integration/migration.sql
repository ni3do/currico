-- LP21 Curriculum Integration Migration
-- Adds transversal competencies, BNE themes, and enhanced curriculum features

-- Add color and icon to curriculum_subjects
ALTER TABLE "curriculum_subjects" ADD COLUMN "color" TEXT;
ALTER TABLE "curriculum_subjects" ADD COLUMN "icon" TEXT;

-- Add anforderungsstufe and hierarchy to curriculum_competencies
ALTER TABLE "curriculum_competencies" ADD COLUMN "anforderungsstufe" TEXT;
ALTER TABLE "curriculum_competencies" ADD COLUMN "parent_id" TEXT;

-- Add self-referential foreign key for competency hierarchy
ALTER TABLE "curriculum_competencies" ADD CONSTRAINT "curriculum_competencies_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "curriculum_competencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add M&I integration flag to resources
ALTER TABLE "resources" ADD COLUMN "is_mi_integrated" BOOLEAN NOT NULL DEFAULT false;

-- Create transversal_competencies table
CREATE TABLE "transversal_competencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name_de" TEXT NOT NULL,
    "name_fr" TEXT,
    "description_de" TEXT NOT NULL,
    "description_fr" TEXT,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "transversal_competencies_pkey" PRIMARY KEY ("id")
);

-- Create unique index on transversal competency code
CREATE UNIQUE INDEX "transversal_competencies_code_key" ON "transversal_competencies"("code");

-- Create bne_themes table
CREATE TABLE "bne_themes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_de" TEXT NOT NULL,
    "name_fr" TEXT,
    "description_de" TEXT NOT NULL,
    "description_fr" TEXT,
    "sdg_number" INTEGER,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "bne_themes_pkey" PRIMARY KEY ("id")
);

-- Create unique index on BNE theme code
CREATE UNIQUE INDEX "bne_themes_code_key" ON "bne_themes"("code");

-- Create resource_transversals junction table
CREATE TABLE "resource_transversals" (
    "resource_id" TEXT NOT NULL,
    "transversal_id" TEXT NOT NULL,

    CONSTRAINT "resource_transversals_pkey" PRIMARY KEY ("resource_id","transversal_id")
);

-- Create resource_bne junction table
CREATE TABLE "resource_bne" (
    "resource_id" TEXT NOT NULL,
    "bne_id" TEXT NOT NULL,

    CONSTRAINT "resource_bne_pkey" PRIMARY KEY ("resource_id","bne_id")
);

-- Add foreign keys for resource_transversals
ALTER TABLE "resource_transversals" ADD CONSTRAINT "resource_transversals_resource_id_fkey"
    FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_transversals" ADD CONSTRAINT "resource_transversals_transversal_id_fkey"
    FOREIGN KEY ("transversal_id") REFERENCES "transversal_competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign keys for resource_bne
ALTER TABLE "resource_bne" ADD CONSTRAINT "resource_bne_resource_id_fkey"
    FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_bne" ADD CONSTRAINT "resource_bne_bne_id_fkey"
    FOREIGN KEY ("bne_id") REFERENCES "bne_themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
