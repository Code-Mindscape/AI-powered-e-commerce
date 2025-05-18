/*
  Warnings:

  - You are about to drop the column `sellerId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Seller` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_supplierId_fkey";

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "sellerId",
DROP COLUMN "supplierId";

-- DropTable
DROP TABLE "Seller";

-- DropTable
DROP TABLE "Supplier";
