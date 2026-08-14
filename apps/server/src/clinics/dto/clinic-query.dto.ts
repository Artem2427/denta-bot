import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicStatus } from '@repo/db';
import { IsEnum, IsOptional } from 'class-validator';

export class ClinicQueryDto {
  @ApiPropertyOptional({ enum: ClinicStatus })
  @IsOptional()
  @IsEnum(ClinicStatus)
  status?: ClinicStatus;
}
