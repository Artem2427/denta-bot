import { Module } from '@nestjs/common';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';

// No PrismaModule import needed — it's @Global().
@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService],
})
export class ClinicsModule {}
