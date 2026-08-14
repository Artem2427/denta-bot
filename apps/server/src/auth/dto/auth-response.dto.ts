import { ApiProperty } from '@nestjs/swagger';

// Deliberately excludes the admin's hashed credential and any other raw
// PlatformAdmin model field — never re-export the raw Prisma model from a
// controller response.
export class PlatformAdminSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  createdAt: Date;
}

// Deliberately omits the session-renewal token (D-06) — it travels only via
// the httpOnly cookie, never the JSON response body.
export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: PlatformAdminSummaryDto })
  platformAdmin: PlatformAdminSummaryDto;
}
