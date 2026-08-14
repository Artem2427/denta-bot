import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/strategies/access-token.strategy';
import { ClinicsService } from './clinics.service';
import { ClinicQueryDto } from './dto/clinic-query.dto';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

// No @Public() on any route here — protected by the existing global
// AccessTokenGuard by default (AUTH-04, already active app-wide).
@ApiTags('clinics')
@ApiBearerAuth('access-token')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  findAll(@Query() query: ClinicQueryDto) {
    return this.clinicsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateClinicDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.clinicsService.create(dto, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClinicDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.clinicsService.update(id, dto, user.sub);
  }
}
