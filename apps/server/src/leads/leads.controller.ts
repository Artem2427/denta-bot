import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { AccessTokenPayload } from '../auth/strategies/access-token.strategy';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { LeadResponseDto } from './dto/lead-response.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadsService } from './leads.service';

// Only POST / is @Public() — the marketing site's public, rate-limited Lead
// creation route (Phase 6, LEAD-01/LEAD-02). Every other route here stays
// protected by the existing global AccessTokenGuard by default (AUTH-04,
// already active app-wide). POST /leads/:id/convert is a state-transition
// action on an existing Lead, not a create, and remains protected.
@ApiTags('leads')
@ApiBearerAuth('access-token')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiCreatedResponse({ type: LeadResponseDto })
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: LeadResponseDto, isArray: true })
  findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: LeadResponseDto })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOkResponse({ type: LeadResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.leadsService.updateStatus(id, dto, user.sub);
  }

  @Post(':id/convert')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LeadResponseDto })
  convert(@Param('id') id: string, @CurrentUser() user: AccessTokenPayload) {
    return this.leadsService.convert(id, user.sub);
  }
}
