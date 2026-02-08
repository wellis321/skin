CREATE TABLE IF NOT EXISTS `shop_product` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`title` text NOT NULL,
	`short_description` text NOT NULL,
	`description` text NOT NULL,
	`price` text NOT NULL,
	`price_amount` real NOT NULL,
	`image_url` text NOT NULL,
	`image_url_secondary` text,
	`quantity_label` text,
	`in_stock` integer NOT NULL DEFAULT true,
	`created_at` integer NOT NULL
);
