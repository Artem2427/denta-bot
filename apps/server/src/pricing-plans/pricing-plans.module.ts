import { Module } from '@nestjs/common';
import { PricingPlansController } from './pricing-plans.controller';
import { PricingPlansService } from './pricing-plans.service';

// No PrismaModule import needed — it's @Global().
@Module({
  controllers: [PricingPlansController],
  providers: [PricingPlansService],
})
export class PricingPlansModule {}
