CREATE TYPE "public"."subscription_plan" AS ENUM('BASICO', 'VITALICIO');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_plan" "subscription_plan";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "access_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approved_at" timestamp with time zone;