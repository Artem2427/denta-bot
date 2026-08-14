import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';

@Injectable()
export class PricingPlansService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    // sortOrder is the model's own intended display ordering, unlike
    // Clinic/Lead/BlogPost's createdAt-desc default.
    return this.prisma.pricingPlan.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async findOne(id: string) {
    const pricingPlan = await this.prisma.pricingPlan.findUnique({
      where: { id },
    });
    if (!pricingPlan) {
      throw new NotFoundException('Pricing plan not found');
    }
    return pricingPlan;
  }

  // No P2002-to-409 translation needed here — PricingPlan.name has no
  // @unique constraint, so duplicate names are allowed (each gets its own id).
  create(dto: CreatePricingPlanDto, adminId: string) {
    return this.prisma.pricingPlan.create({
      data: { ...dto, updatedById: adminId },
    });
  }

  async update(id: string, dto: UpdatePricingPlanDto, adminId: string) {
    try {
      return await this.prisma.pricingPlan.update({
        where: { id },
        data: { ...dto, updatedById: adminId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Pricing plan not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.pricingPlan.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Pricing plan not found');
      }
      throw error;
    }
  }
}
