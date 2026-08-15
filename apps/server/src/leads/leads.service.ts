import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLeadDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'Either email or phone must be provided',
      );
    }
    return this.prisma.lead.create({ data: dto });
  }

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
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { updatedBy: { select: { email: true } } },
    });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto, adminId: string) {
    if (dto.status === 'converted') {
      throw new BadRequestException(
        'Use POST /leads/:id/convert to mark a Lead as converted — it also creates the linked Clinic record',
      );
    }
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

  async convert(leadId: string, adminId: string) {
    // Pre-transaction validation: a rejected conversion never touches the DB.
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    if (lead.status === 'converted') {
      throw new ConflictException('Lead already converted');
    }
    if (!lead.email) {
      throw new BadRequestException(
        'Lead has no email — add one before converting',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Re-fetch inside the transaction to guard against a race where another
      // request converted this Lead between the pre-check above and here.
      const freshLead = await tx.lead.findUniqueOrThrow({
        where: { id: leadId },
      });
      if (freshLead.status === 'converted') {
        throw new ConflictException('Lead already converted');
      }
      if (!freshLead.email) {
        throw new BadRequestException(
          'Lead has no email — add one before converting',
        );
      }

      let clinic: { id: string };
      try {
        clinic = await tx.clinic.create({
          data: {
            name: freshLead.clinicName ?? freshLead.name,
            email: freshLead.email,
            plan: 'trial',
            updatedById: adminId,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'A clinic with this email already exists',
          );
        }
        throw error;
      }

      return tx.lead.update({
        where: { id: leadId },
        data: {
          status: 'converted',
          clinicId: clinic.id,
          updatedById: adminId,
        },
      });
    });
  }
}
