import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource, LeadStatus } from '@repo/db';

// Response DTOs give openapi-typescript a real class to introspect, so
// GET/PATCH/POST /leads responses carry a typed shape in the generated
// schema.d.ts instead of `content?: never` — same rationale as
// ClinicResponseDto (Plan 05-05). Purely a Swagger-doc-generation concern:
// the controller still returns the raw Prisma model.
export class LeadUpdatedByDto {
  @ApiProperty()
  email: string;
}

export class LeadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  clinicName: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  email: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  message: string | null;

  @ApiProperty({ enum: LeadSource })
  source: LeadSource;

  @ApiProperty({ enum: LeadStatus })
  status: LeadStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  clinicId: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedById: string | null;

  @ApiPropertyOptional({ type: () => LeadUpdatedByDto, nullable: true })
  updatedBy?: LeadUpdatedByDto | null;
}
