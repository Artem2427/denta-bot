import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '@repo/db';
import { IsEnum } from 'class-validator';

// Never declare `updatedById` here — it is set exclusively server-side from
// @CurrentUser().sub in LeadsService, never accepted from the client.
export class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  status: LeadStatus;
}
