import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/strategies/access-token.strategy';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { PricingPlansService } from './pricing-plans.service';

// No @Public() on any route here — protected by the existing global
// AccessTokenGuard by default (AUTH-04, already active app-wide).
@ApiTags('pricing-plans')
@ApiBearerAuth('access-token')
@Controller('pricing-plans')
export class PricingPlansController {
  constructor(private readonly pricingPlansService: PricingPlansService) {}

  @Get()
  findAll() {
    return this.pricingPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingPlansService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreatePricingPlanDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.pricingPlansService.create(dto, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePricingPlanDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.pricingPlansService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.pricingPlansService.remove(id);
  }
}
