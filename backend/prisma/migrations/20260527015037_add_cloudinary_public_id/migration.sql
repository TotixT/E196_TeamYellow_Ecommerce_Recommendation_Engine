/*
  Warnings:

  - Added the required column `cloudinary_public_id` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "cloudinary_public_id" VARCHAR(500) NOT NULL;
