import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Response DTOs give openapi-typescript a real class to introspect, so
// GET/POST/PATCH /blog-posts responses carry a typed shape in the generated
// schema.d.ts instead of `content?: never` — same rationale as
// ClinicResponseDto (Plan 05-05) / LeadResponseDto (Plan 05-06). Purely a
// Swagger-doc-generation concern: the controller still returns the raw
// Prisma model, no runtime serialization/transform is introduced here.
export class BlogPostUpdatedByDto {
  @ApiProperty()
  email: string;
}

export class BlogPostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  excerpt: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  readTime: string;

  @ApiProperty()
  image: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  body: Record<string, unknown>;

  @ApiProperty()
  published: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: String, nullable: true })
  updatedById: string | null;

  @ApiPropertyOptional({ type: () => BlogPostUpdatedByDto, nullable: true })
  updatedBy?: BlogPostUpdatedByDto | null;
}
