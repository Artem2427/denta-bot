import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

// Never declare `updatedById` here — it is set exclusively server-side from
// @CurrentUser().sub in BlogPostsService, never accepted from the client.
export class CreateBlogPostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  image: string;

  // Matches the schema's `Json` type — accept any JSON object, no further
  // shape validation this phase. `additionalProperties: true` is required
  // for openapi-typescript to emit `Record<string, unknown>` instead of
  // collapsing to `Record<string, never>` for an untyped object schema.
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  body: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
