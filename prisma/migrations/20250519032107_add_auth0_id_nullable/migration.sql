/*
  Warnings:

  - A unique constraint covering the columns `[auth0Id]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth0Id` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "auth0Id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_auth0Id_key" ON "Customer"("auth0Id");
