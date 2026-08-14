import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/strategies/access-token.strategy';
import { LeadQueryDto } from './dto/lead-query.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadsService } from './leads.service';

// No @Public() on any route here — protected by the existing global
// AccessTokenGuard by default (AUTH-04, already active app-wide).
// No POST (create) route this phase — Lead creation is Phase 6's scope
// (apps/web's public Contacts/Demo forms).
@ApiTags('leads')
@ApiBearerAuth('access-token')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.leadsService.updateStatus(id, dto, user.sub);
  }
}
