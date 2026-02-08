CREATE TABLE IF NOT EXISTS `group_class` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`product_slug` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`description` text,
	`max_attendees` integer,
	`booking_url` text,
	`created_at` integer NOT NULL
);
