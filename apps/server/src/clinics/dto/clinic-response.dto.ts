import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicStatus } from '@repo/db';

// Response DTOs give openapi-typescript a real class to introspect, so
// GET/POST/PATCH /clinics responses carry a typed shape in the generated
// schema.d.ts instead of `content?: never` — required for INFRA-04's typed
// client to actually type real fields (not just prove the path key exists).
// Purely a Swagger-doc-generation concern: the controller still returns the
// raw Prisma model, no runtime serialization/transform is introduced here.
export class ClinicUpdatedByDto {
  @ApiProperty()
  email: string;
}

export class ClinicResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  phone: string | null;

  @ApiProperty({ enum: ClinicStatus })
  status: ClinicStatus;

  @ApiProperty()
  plan: string;

  @ApiProperty()
  messageCount: number;

  @ApiProperty()
  bookingsCount: number;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  lastActiveAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedById: string | null;

  @ApiPropertyOptional({ type: () => ClinicUpdatedByDto, nullable: true })
  updatedBy?: ClinicUpdatedByDto | null;
}
