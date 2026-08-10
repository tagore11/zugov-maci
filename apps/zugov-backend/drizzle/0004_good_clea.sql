CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text,
	"chain_id" integer,
	"nonce" text,
	"nonce_expires_at" integer,
	"created_at" integer NOT NULL,
	"expires_at" integer NOT NULL
);
