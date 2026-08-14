import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicStatus } from '@repo/db';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Never declare `updatedById` here — it is set exclusively server-side from
// @CurrentUser().sub in ClinicsService, never accepted from the client.
export class CreateClinicDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ClinicStatus })
  @IsOptional()
  @IsEnum(ClinicStatus)
  status?: ClinicStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  plan: string;
}
