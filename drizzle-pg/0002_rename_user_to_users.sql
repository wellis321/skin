-- "user" is a reserved word in PostgreSQL; rename to "users" so queries work reliably.
ALTER TABLE "user" RENAME TO "users";
