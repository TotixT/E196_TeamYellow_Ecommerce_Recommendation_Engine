-- AlterTable
ALTER TABLE "verification_tokens" DROP CONSTRAINT "verification_tokens_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "token" SET DATA TYPE TEXT,
ADD CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "verification_tokens_id_seq";
