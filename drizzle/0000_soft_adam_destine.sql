CREATE TYPE "public"."dependency_type" AS ENUM('imports', 'extends', 'implements', 'calls', 'references', 'depends_on');--> statement-breakpoint
CREATE TYPE "public"."symbol_type" AS ENUM('function', 'class', 'interface', 'variable', 'import', 'export', 'type', 'namespace', 'module');--> statement-breakpoint
CREATE TABLE "dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid,
	"target_id" uuid,
	"type" "dependency_type" NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"vector" text NOT NULL,
	"symbol_id" uuid,
	"model" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"package_id" uuid,
	"content_hash" text NOT NULL,
	"language" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"repository_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"last_parsed" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "symbols" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "symbol_type" NOT NULL,
	"file_id" uuid,
	"start_line" integer NOT NULL,
	"end_line" integer NOT NULL,
	"start_column" integer NOT NULL,
	"end_column" integer NOT NULL,
	"signature" text,
	"documentation" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_source_id_symbols_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."symbols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_target_id_symbols_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."symbols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_symbol_id_symbols_id_fk" FOREIGN KEY ("symbol_id") REFERENCES "public"."symbols"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symbols" ADD CONSTRAINT "symbols_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;