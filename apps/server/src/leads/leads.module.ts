import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

// No PrismaModule import needed — it's @Global().
// ThrottlerModule.forRoot is required even for the route-scoped ThrottlerGuard
// on POST /leads — it provides ThrottlerStorage/default options that the
// guard resolves via DI.
@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
