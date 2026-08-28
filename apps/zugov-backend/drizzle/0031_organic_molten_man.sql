-- Union-as-community merge (2026-08-28 /plan-eng-review, D1/D2/D8/D9).
--
-- drizzle-kit's auto-generated statement order for this schema diff was DROP TABLE "unions"
-- CASCADE first, which would cascade-delete every union_memberships row before its data could be
-- moved. Hand-reordered below: add the new column/indexes -> move the data (reusing each union's
-- existing UUID, confirmed collision-safe since both unions.id and communities.id were always
-- crypto.randomUUID()) -> repoint the FK -> only then drop the now-empty-of-meaning unions table.
--> statement-breakpoint

-- 1. Add communities.type (every existing row is correctly 'standard', zero backfill decision
--    needed) and both indexes in the same pass (D9 bundles the pre-existing TODOS.md P3 gap on
--    communities.category alongside the new type index — same table, functionally free).
ALTER TABLE "communities" ADD COLUMN "type" text DEFAULT 'standard' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "communities_type_idx" ON "communities" USING btree ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "communities_category_idx" ON "communities" USING btree ("category");
--> statement-breakpoint

-- 2. Move every existing union row into communities, reusing its id. registered_at mirrors
--    created_at (unions had no separate registered_at column; every other community sets both to
--    the same value at creation anyway). parent_community_id/category stay NULL (unions never
--    have either). default_tier_id stays NULL for migrated rows — this app isn't live yet, no
--    existing union has real join traffic depending on it, and any NEW union created after this
--    migration gets a real placeholder tier via createCommunityRow() (D6/D13). allow_join stays
--    at its column default (false), matching D3's "union content authority never flows through
--    individual-wallet joining" model.
INSERT INTO "communities" (
  "id", "display_name", "description", "logo", "creator_address", "type",
  "created_at", "registered_at"
)
SELECT
  "id", "display_name", "description", "logo", "creator_address", 'union',
  "created_at", "created_at"
FROM "unions";
--> statement-breakpoint

-- 3. Repoint union_memberships.union_id from unions.id to communities.id — the column's actual
--    values never change (same ids reused above), only the FK's target table.
ALTER TABLE "union_memberships" DROP CONSTRAINT "union_memberships_union_id_unions_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "union_memberships" ADD CONSTRAINT "union_memberships_union_id_communities_id_fk" FOREIGN KEY ("union_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 4. Now safe to drop — every row already lives in communities, and union_memberships no longer
--    references this table at all.
ALTER TABLE "unions" DISABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP TABLE "unions" CASCADE;
