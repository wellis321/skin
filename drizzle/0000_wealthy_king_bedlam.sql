CREATE TABLE `assessment` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`overall_score` integer NOT NULL,
	`wrinkles_score` integer NOT NULL,
	`wrinkles_forehead` integer NOT NULL,
	`wrinkles_crow_feet` integer NOT NULL,
	`wrinkles_fine_lines` integer NOT NULL,
	`spots_score` integer NOT NULL,
	`spots_blemishes` integer NOT NULL,
	`spots_hyperpigmentation` integer NOT NULL,
	`thumbnail_path` text,
	`face_details_age` integer,
	`face_details_gender` text,
	`face_details_gender_probability` real,
	`face_details_expressions` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);