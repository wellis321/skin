CREATE TABLE IF NOT EXISTS `product_interest` (
	`id` text PRIMARY KEY NOT NULL,
	`product_slug` text NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`user_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
