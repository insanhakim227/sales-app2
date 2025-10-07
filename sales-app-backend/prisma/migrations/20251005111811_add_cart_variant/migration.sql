-- AlterTable
ALTER TABLE "public"."cart" ADD COLUMN     "size" TEXT,
ADD COLUMN     "variant_id" INTEGER;

-- CreateIndex
CREATE INDEX "cart_variant_id_idx" ON "public"."cart"("variant_id");

-- AddForeignKey
ALTER TABLE "public"."cart" ADD CONSTRAINT "cart_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
