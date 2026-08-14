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

  // Optional: present on POST /login, omitted on POST /refresh — refresh()
  // doesn't re-fetch the PlatformAdmin row (the client already has the
  // summary from its original login response; no behavioral need to pay an
  // extra DB round trip on every rotation just to repeat it).
  @ApiProperty({ type: PlatformAdminSummaryDto, required: false })
  platformAdmin?: PlatformAdminSummaryDto;
}
