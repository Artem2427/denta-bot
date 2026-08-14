import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@repo/db';
import type { PrismaService } from '../prisma/prisma.service';
import { LeadsService } from './leads.service';

describe('LeadsService.convert', () => {
  const adminId = 'admin-1';

  function buildPrismaMock() {
    const txLeadFindUniqueOrThrow = jest.fn();
    const txClinicCreate = jest.fn();
    const txLeadUpdate = jest.fn();

    const tx = {
      lead: {
        findUniqueOrThrow: txLeadFindUniqueOrThrow,
        update: txLeadUpdate,
      },
      clinic: {
        create: txClinicCreate,
      },
    };

    const leadFindUnique = jest.fn();
    const $transaction = jest.fn(
      async (fn: (tx: typeof tx) => Promise<unknown>) => fn(tx),
    );

    const prisma = {
      lead: {
        findUnique: leadFindUnique,
      },
      $transaction,
    } as unknown as PrismaService;

    return {
      prisma,
      leadFindUnique,
      $transaction,
      txLeadFindUniqueOrThrow,
      txClinicCreate,
      txLeadUpdate,
    };
  }

  it('Test 1: converts a Lead with a valid, unused email into a new Clinic + marks the Lead converted', async () => {
    const mocks = buildPrismaMock();
    const lead = {
      id: 'lead-1',
      name: 'Lead Name',
      clinicName: null,
      email: 'lead@example.com',
      status: 'new',
    };
    mocks.leadFindUnique.mockResolvedValue(lead);
    mocks.txLeadFindUniqueOrThrow.mockResolvedValue(lead);
    const clinic = { id: 'clinic-1', email: lead.email };
    mocks.txClinicCreate.mockResolvedValue(clinic);
    const updatedLead = { ...lead, status: 'converted', clinicId: clinic.id };
    mocks.txLeadUpdate.mockResolvedValue(updatedLead);

    const service = new LeadsService(mocks.prisma);
    const result = await service.convert('lead-1', adminId);

    expect(result).toEqual(updatedLead);
    expect(mocks.txClinicCreate).toHaveBeenCalledWith({
      data: {
        name: lead.name,
        email: lead.email,
        plan: 'trial',
        updatedById: adminId,
      },
    });
    expect(mocks.txLeadUpdate).toHaveBeenCalledWith({
      where: { id: 'lead-1' },
      data: {
        status: 'converted',
        clinicId: clinic.id,
        updatedById: adminId,
      },
    });
  });

  it('Test 2: rejects conversion of a Lead with no email with 400, before any write happens', async () => {
    const mocks = buildPrismaMock();
    const lead = {
      id: 'lead-2',
      name: 'Lead Name',
      clinicName: null,
      email: null,
      status: 'new',
    };
    mocks.leadFindUnique.mockResolvedValue(lead);

    const service = new LeadsService(mocks.prisma);

    await expect(service.convert('lead-2', adminId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mocks.$transaction).not.toHaveBeenCalled();
    expect(mocks.txClinicCreate).not.toHaveBeenCalled();
  });

  it('Test 3: rejects conversion with 409 when the email collides with an existing Clinic, leaving the Lead unmodified', async () => {
    const mocks = buildPrismaMock();
    const lead = {
      id: 'lead-3',
      name: 'Lead Name',
      clinicName: null,
      email: 'taken@example.com',
      status: 'new',
    };
    mocks.leadFindUnique.mockResolvedValue(lead);
    mocks.txLeadFindUniqueOrThrow.mockResolvedValue(lead);
    mocks.txClinicCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.9.1',
      }),
    );

    const service = new LeadsService(mocks.prisma);

    await expect(service.convert('lead-3', adminId)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mocks.txLeadUpdate).not.toHaveBeenCalled();
  });

  it('Test 4: rejects converting an already-converted Lead with 409, without creating a second Clinic', async () => {
    const mocks = buildPrismaMock();
    const lead = {
      id: 'lead-4',
      name: 'Lead Name',
      clinicName: null,
      email: 'already@example.com',
      status: 'converted',
    };
    mocks.leadFindUnique.mockResolvedValue(lead);

    const service = new LeadsService(mocks.prisma);

    await expect(service.convert('lead-4', adminId)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mocks.$transaction).not.toHaveBeenCalled();
    expect(mocks.txClinicCreate).not.toHaveBeenCalled();
  });
});
