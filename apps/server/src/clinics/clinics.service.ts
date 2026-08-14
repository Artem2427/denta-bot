import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';
import { ClinicQueryDto } from './dto/clinic-query.dto';
import { CreateClinicDto } from './dto/create-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ClinicQueryDto) {
    return this.prisma.clinic.findMany({
      where: query.status ? { status: query.status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    return clinic;
  }

  async create(dto: CreateClinicDto, adminId: string) {
    try {
      return await this.prisma.clinic.create({
        data: { ...dto, updatedById: adminId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A clinic with this email already exists');
      }
      throw error;
    }
  }
}
