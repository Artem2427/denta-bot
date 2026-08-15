import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '@repo/db';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

// Public create-Lead input contract — the only fields a marketing-site
// visitor (Contacts/Demo forms) can set. `status`/`updatedById`/`clinicId`
// are intentionally never declared here: the global ValidationPipe's
// `forbidNonWhitelisted` already strips/rejects them if a client sends them.
export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clinicName?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateLeadDto) => !o.phone)
  @IsString()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateLeadDto) => !o.email)
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ enum: LeadSource })
  @IsEnum(LeadSource)
  source: LeadSource;
}
