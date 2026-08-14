import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';
import { LeadQueryDto } from './dto/lead-query.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: LeadQueryDto) {
    const createdAt: Prisma.DateTimeFilter | undefined =
      query.from || query.to
        ? {
            gte: query.from ? new Date(query.from) : undefined,
            lte: query.to ? new Date(query.to) : undefined,
          }
        : undefined;

    return this.prisma.lead.findMany({
      where: {
        status: query.status ?? undefined,
        createdAt,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto, adminId: string) {
    try {
      // Setting the same status value the lead already has is a valid,
      // idempotent update — no special-case short-circuit needed.
      return await this.prisma.lead.update({
        where: { id },
        data: { status: dto.status, updatedById: adminId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Lead not found');
      }
      throw error;
    }
  }
}
