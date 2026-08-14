import { ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '@repo/db';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class LeadQueryDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}
