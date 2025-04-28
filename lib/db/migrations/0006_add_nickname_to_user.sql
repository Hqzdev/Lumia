ALTER TABLE "User" ADD COLUMN "nickname" varchar(32) NOT NULL;
CREATE UNIQUE INDEX "User_nickname_unique" ON "User" ("nickname"); 