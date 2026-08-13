-- Migration: update ActivityType enum and Unit enum
-- Renames old enums, creates new ones, migrates columns, drops old

-- ─── ActivityType ────────────────────────────────────────────────────────────

ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";

CREATE TYPE "ActivityType" AS ENUM (
  'CORTE_BANANA',
  'PULVERIZACAO_FOLHAS',
  'PULVERIZACAO_CACHOS',
  'ADUBACAO',
  'ROCADA',
  'DESFOLHA',
  'DESBASTE_MUDAS',
  'ENSACAMENTO',
  'ESCORAMENTO',
  'PLANTIO',
  'REPLANTIO',
  'COROAMENTO',
  'LIMPEZA_ACEIRO',
  'LIMPEZA_VALA',
  'OUTRO'
);

ALTER TABLE "Activity"
  ALTER COLUMN "type" TYPE "ActivityType"
  USING (
    CASE "type"::text
      WHEN 'PULVERIZACAO'    THEN 'PULVERIZACAO_FOLHAS'
      WHEN 'ADUBACAO'        THEN 'ADUBACAO'
      WHEN 'ROCAGEM'         THEN 'ROCADA'
      WHEN 'DESFOLHA'        THEN 'DESFOLHA'
      WHEN 'DESBASTE'        THEN 'DESBASTE_MUDAS'
      WHEN 'ENSACAMENTO'     THEN 'ENSACAMENTO'
      WHEN 'ESCORA'          THEN 'ESCORAMENTO'
      WHEN 'IRRIGACAO'       THEN 'OUTRO'
      WHEN 'RETIRADA_BANANA' THEN 'CORTE_BANANA'
      WHEN 'RETIRADA_CAIXAS' THEN 'OUTRO'
      WHEN 'PLANTIO'         THEN 'PLANTIO'
      WHEN 'OUTRO'           THEN 'OUTRO'
      ELSE 'OUTRO'
    END::"ActivityType"
  );

DROP TYPE "ActivityType_old";

-- ─── Unit ────────────────────────────────────────────────────────────────────

ALTER TYPE "Unit" RENAME TO "Unit_old";

CREATE TYPE "Unit" AS ENUM (
  'KG',
  'LITRO',
  'CACHO',
  'UNIDADE',
  'SACO',
  'CAIXA'
);

-- Activity.unit (nullable)
ALTER TABLE "Activity"
  ALTER COLUMN "unit" TYPE "Unit"
  USING (
    CASE "unit"::text
      WHEN 'KG'       THEN 'KG'
      WHEN 'LITRO'    THEN 'LITRO'
      WHEN 'CAIXA'    THEN 'CAIXA'
      WHEN 'CACHO'    THEN 'CACHO'
      WHEN 'UNIDADE'  THEN 'UNIDADE'
      WHEN 'SACO'     THEN 'SACO'
      WHEN 'PENCA'    THEN 'UNIDADE'
      WHEN 'DUZIA'    THEN 'UNIDADE'
      WHEN 'TONELADA' THEN 'KG'
      ELSE NULL
    END::"Unit"
  );

-- Harvest.unit (required)
ALTER TABLE "Harvest"
  ALTER COLUMN "unit" TYPE "Unit"
  USING (
    CASE "unit"::text
      WHEN 'KG'       THEN 'KG'
      WHEN 'LITRO'    THEN 'LITRO'
      WHEN 'CAIXA'    THEN 'CAIXA'
      WHEN 'CACHO'    THEN 'CACHO'
      WHEN 'UNIDADE'  THEN 'UNIDADE'
      WHEN 'SACO'     THEN 'SACO'
      WHEN 'PENCA'    THEN 'UNIDADE'
      WHEN 'DUZIA'    THEN 'UNIDADE'
      WHEN 'TONELADA' THEN 'KG'
      ELSE 'UNIDADE'
    END::"Unit"
  );

-- ProductPrice.unit
ALTER TABLE "ProductPrice"
  ALTER COLUMN "unit" TYPE "Unit"
  USING (
    CASE "unit"::text
      WHEN 'KG'       THEN 'KG'
      WHEN 'LITRO'    THEN 'LITRO'
      WHEN 'CAIXA'    THEN 'CAIXA'
      WHEN 'CACHO'    THEN 'CACHO'
      WHEN 'UNIDADE'  THEN 'UNIDADE'
      WHEN 'SACO'     THEN 'SACO'
      WHEN 'PENCA'    THEN 'UNIDADE'
      WHEN 'DUZIA'    THEN 'UNIDADE'
      WHEN 'TONELADA' THEN 'KG'
      ELSE 'UNIDADE'
    END::"Unit"
  );

DROP TYPE "Unit_old";
