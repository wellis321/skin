CREATE TABLE "assessment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"overall_score" integer NOT NULL,
	"wrinkles_score" integer NOT NULL,
	"wrinkles_forehead" integer NOT NULL,
	"wrinkles_crow_feet" integer NOT NULL,
	"wrinkles_fine_lines" integer NOT NULL,
	"spots_score" integer NOT NULL,
	"spots_blemishes" integer NOT NULL,
	"spots_hyperpigmentation" integer NOT NULL,
	"structure_score" integer,
	"thumbnail_path" text,
	"face_details_age" integer,
	"face_details_gender" text,
	"face_details_gender_probability" real,
	"face_details_expressions" text
);
--> statement-breakpoint
CREATE TABLE "class_interest" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"user_id" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_class" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"product_slug" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"description" text,
	"max_attendees" integer,
	"booking_url" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "one_to_one_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"session_focus" text,
	"session_details" text,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_interest" (
	"id" text PRIMARY KEY NOT NULL,
	"product_slug" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"user_id" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_product" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text NOT NULL,
	"price" text NOT NULL,
	"price_amount" real NOT NULL,
	"image_url" text NOT NULL,
	"image_url_secondary" text,
	"quantity_label" text,
	"in_stock" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "shop_product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"profile_age" integer NOT NULL,
	"profile_gender" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_interest" ADD CONSTRAINT "class_interest_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "one_to_one_booking" ADD CONSTRAINT "one_to_one_booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_interest" ADD CONSTRAINT "product_interest_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;