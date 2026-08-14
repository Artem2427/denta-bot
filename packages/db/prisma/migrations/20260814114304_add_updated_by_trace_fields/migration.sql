-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "PricingPlan" ADD COLUMN     "updatedById" TEXT;

-- AddForeignKey
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "PlatformAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "PlatformAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "PlatformAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingPlan" ADD CONSTRAINT "PricingPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "PlatformAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
