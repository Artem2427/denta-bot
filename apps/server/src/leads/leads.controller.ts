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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/strategies/access-token.strategy';
import { LeadQueryDto } from './dto/lead-query.dto';
import { LeadResponseDto } from './dto/lead-response.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadsService } from './leads.service';

// No @Public() on any route here — protected by the existing global
// AccessTokenGuard by default (AUTH-04, already active app-wide).
// No POST /leads (create) route this phase — Lead creation is Phase 6's
// scope (apps/web's public Contacts/Demo forms). POST /leads/:id/convert
// below is a state-transition action on an existing Lead, not a create.
@ApiTags('leads')
@ApiBearerAuth('access-token')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

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
