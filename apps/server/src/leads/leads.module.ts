import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

// No PrismaModule import needed — it's @Global().
@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
