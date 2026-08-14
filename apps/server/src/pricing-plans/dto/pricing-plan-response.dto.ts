import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Response DTOs give openapi-typescript a real class to introspect, so
// GET/POST/PATCH /pricing-plans responses carry a typed shape in the
// generated schema.d.ts instead of `content?: never` — same rationale as
// ClinicResponseDto (Plan 05-05) / LeadResponseDto (Plan 05-06). Purely a
// Swagger-doc-generation concern: the controller still returns the raw
// Prisma model, no runtime serialization/transform is introduced here.
export class PricingPlanUpdatedByDto {
  @ApiProperty()
  email: string;
}

export class PricingPlanResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  monthlyPrice: string;

  @ApiProperty()
  yearlyPrice: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty()
  isPopular: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  published: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedById: string | null;

  @ApiPropertyOptional({
    type: () => PricingPlanUpdatedByDto,
    nullable: true,
  })
  updatedBy?: PricingPlanUpdatedByDto | null;
}
