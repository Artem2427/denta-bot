import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '@repo/db';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Public create-Lead input contract — the only fields a marketing-site
// visitor (Contacts/Demo forms) can set. `status`/`updatedById`/`clinicId`
// are intentionally never declared here: the global ValidationPipe's
// `forbidNonWhitelisted` already strips/rejects them if a client sends them.
//
// email/phone are individually optional but always type/format-validated
// when present — @ValidateIf would skip a property's decorators entirely
// when its condition is false, which silently disabled ALL validation
// (including @IsString) whenever BOTH fields were supplied. The "at least
// one of email/phone is required" rule is enforced in LeadsService.create()
// instead, after both fields have already been format-checked here.
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
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ enum: LeadSource })
  @IsEnum(LeadSource)
  source: LeadSource;
}
