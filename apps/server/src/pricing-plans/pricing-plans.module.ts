import { Module } from '@nestjs/common';
import { PricingPlansController } from './pricing-plans.controller';
import { PricingPlansService } from './pricing-plans.service';
import { PublicPricingPlansController } from './public-pricing-plans.controller';

// No PrismaModule import needed — it's @Global().
@Module({
  controllers: [PricingPlansController, PublicPricingPlansController],
  providers: [PricingPlansService],
})
export class PricingPlansModule {}
