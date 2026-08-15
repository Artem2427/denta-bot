import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PricingPlanResponseDto } from './dto/pricing-plan-response.dto';
import { PricingPlansService } from './pricing-plans.service';

// Class-level @Public() — every route here is unauthenticated by design
// (apps/web's marketing Prices page). Reads only, published-only
// (enforced in PricingPlansService, not here — T-06-10/T-06-12). The
// protected admin PricingPlansController (create/update/delete,
// GET /pricing-plans(/:id)) stays untouched behind the global
// AccessTokenGuard.
@Public()
@ApiTags('public-pricing-plans')
@Controller('public/pricing-plans')
export class PublicPricingPlansController {
  constructor(private readonly pricingPlansService: PricingPlansService) {}

  @Get()
  @ApiOkResponse({ type: PricingPlanResponseDto, isArray: true })
  findAllPublished() {
    return this.pricingPlansService.findAllPublished();
  }
}
