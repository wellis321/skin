CREATE TABLE IF NOT EXISTS `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`profile_age` integer NOT NULL,
	`profile_gender` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
