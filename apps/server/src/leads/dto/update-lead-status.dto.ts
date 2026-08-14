import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '@repo/db';
import { IsEnum } from 'class-validator';

// Never declare `updatedById` here — it is set exclusively server-side from
// @CurrentUser().sub in LeadsService, never accepted from the client.
// `status: 'converted'` validates here (full LeadStatus enum) but is rejected
// at the service layer — LeadsService.updateStatus() throws BadRequestException
// for it, since only LeadsService.convert() may set it (it also creates the
// linked Clinic atomically; setting the enum value alone would corrupt the
// Lead/Clinic invariant).
export class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  status: LeadStatus;
}
