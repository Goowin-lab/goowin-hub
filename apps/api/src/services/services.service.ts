import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BillingCycle,
  HistoryEventType,
  Prisma,
  ServiceCategory,
  ServiceTechnicalStatus,
  ServiceType,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

const serviceSelect = {
  amount: true,
  billingCycle: true,
  category: true,
  clientId: true,
  createdAt: true,
  currencyCode: true,
  id: true,
  name: true,
  nextRenewalAt: true,
  notes: true,
  provider: true,
  serviceType: true,
  technicalStatus: true,
  updatedAt: true,
} satisfies Prisma.ServiceSelect;

type ServiceRecord = Prisma.ServiceGetPayload<{
  select: typeof serviceSelect;
}>;

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createServiceDto: CreateServiceDto,
    actorUserId: string,
  ): Promise<ServiceResponseDto> {
    await this.ensureClientExists(createServiceDto.clientId);

    const service = await this.prisma.$transaction(async (transaction) => {
      const createdService = await transaction.service.create({
        data: {
          amount: createServiceDto.amount,
          billingCycle:
            createServiceDto.billingCycle ??
            this.getDefaultBillingCycle(createServiceDto.serviceType),
          category: this.getServiceCategory(createServiceDto.serviceType),
          clientId: createServiceDto.clientId,
          currencyCode: createServiceDto.currencyCode ?? 'COP',
          name: createServiceDto.name,
          nextRenewalAt: createServiceDto.renewalDate,
          notes: createServiceDto.notes,
          provider: createServiceDto.provider,
          serviceType: createServiceDto.serviceType,
          technicalStatus:
            createServiceDto.status ?? ServiceTechnicalStatus.ACTIVE,
        },
        select: serviceSelect,
      });

      await transaction.historyEvent.create({
        data: {
          actorUserId,
          clientId: createdService.clientId,
          eventType: HistoryEventType.SERVICE_CREATED,
          serviceId: createdService.id,
          title: 'Service created',
          description: `Service "${createdService.name}" was created.`,
          metadata: this.buildServiceMetadata(createdService),
        },
      });

      return createdService;
    });

    return this.toResponse(service);
  }

  async findAll(): Promise<ServiceResponseDto[]> {
    const services = await this.prisma.service.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: serviceSelect,
    });

    return services.map((service) => this.toResponse(service));
  }

  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.findServiceOrThrow(id);
    return this.toResponse(service);
  }

  async findByClient(clientId: string): Promise<ServiceResponseDto[]> {
    await this.ensureClientExists(clientId);

    const services = await this.prisma.service.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: serviceSelect,
      where: {
        clientId,
      },
    });

    return services.map((service) => this.toResponse(service));
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    actorUserId: string,
  ): Promise<ServiceResponseDto> {
    const existingService = await this.findServiceOrThrow(id);
    const nextServiceType =
      updateServiceDto.serviceType ?? existingService.serviceType;

    const service = await this.prisma.$transaction(async (transaction) => {
      const updatedService = await transaction.service.update({
        data: {
          amount: updateServiceDto.amount,
          billingCycle: updateServiceDto.billingCycle,
          category:
            updateServiceDto.serviceType === undefined
              ? undefined
              : this.getServiceCategory(nextServiceType),
          currencyCode: updateServiceDto.currencyCode,
          name: updateServiceDto.name,
          nextRenewalAt: updateServiceDto.renewalDate,
          notes: updateServiceDto.notes,
          provider: updateServiceDto.provider,
          serviceType: updateServiceDto.serviceType,
          technicalStatus: updateServiceDto.status,
        },
        select: serviceSelect,
        where: {
          id,
        },
      });

      await transaction.historyEvent.create({
        data: {
          actorUserId,
          clientId: updatedService.clientId,
          eventType: HistoryEventType.SERVICE_UPDATED,
          serviceId: updatedService.id,
          title: 'Service updated',
          description: `Service "${updatedService.name}" was updated.`,
          metadata: {
            previous: this.buildServiceMetadata(existingService),
            next: this.buildServiceMetadata(updatedService),
          },
        },
      });

      return updatedService;
    });

    return this.toResponse(service);
  }

  async suspend(id: string, actorUserId: string): Promise<ServiceResponseDto> {
    return this.changeStatus(
      id,
      ServiceTechnicalStatus.SUSPENDED,
      HistoryEventType.SERVICE_SUSPENDED,
      'Service suspended',
      actorUserId,
    );
  }

  async reactivate(
    id: string,
    actorUserId: string,
  ): Promise<ServiceResponseDto> {
    return this.changeStatus(
      id,
      ServiceTechnicalStatus.ACTIVE,
      HistoryEventType.SERVICE_REACTIVATED,
      'Service reactivated',
      actorUserId,
    );
  }

  async cancel(id: string, actorUserId: string): Promise<ServiceResponseDto> {
    return this.changeStatus(
      id,
      ServiceTechnicalStatus.CANCELLED,
      HistoryEventType.SERVICE_CANCELLED,
      'Service cancelled',
      actorUserId,
    );
  }

  private async changeStatus(
    id: string,
    nextStatus: ServiceTechnicalStatus,
    eventType: HistoryEventType,
    title: string,
    actorUserId: string,
  ): Promise<ServiceResponseDto> {
    const existingService = await this.findServiceOrThrow(id);

    const service = await this.prisma.$transaction(async (transaction) => {
      const updatedService = await transaction.service.update({
        data: {
          technicalStatus: nextStatus,
        },
        select: serviceSelect,
        where: {
          id,
        },
      });

      await transaction.historyEvent.create({
        data: {
          actorUserId,
          clientId: updatedService.clientId,
          eventType,
          serviceId: updatedService.id,
          title,
          description: `Service "${updatedService.name}" changed status.`,
          metadata: {
            previousStatus: existingService.technicalStatus,
            nextStatus,
          },
        },
      });

      return updatedService;
    });

    return this.toResponse(service);
  }

  private async ensureClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.client.findUnique({
      select: {
        id: true,
      },
      where: {
        id: clientId,
      },
    });

    if (!client) {
      throw new NotFoundException('Client was not found.');
    }
  }

  private async findServiceOrThrow(id: string): Promise<ServiceRecord> {
    const service = await this.prisma.service.findUnique({
      select: serviceSelect,
      where: {
        id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service was not found.');
    }

    return service;
  }

  private getServiceCategory(serviceType: ServiceType): ServiceCategory {
    if (serviceType === ServiceType.GOOGLE_ADS) {
      return ServiceCategory.PREPAID;
    }

    return ServiceCategory.RECURRENT;
  }

  private getDefaultBillingCycle(serviceType: ServiceType): BillingCycle {
    if (serviceType === ServiceType.SEO) {
      return BillingCycle.MONTHLY;
    }

    if (serviceType === ServiceType.GOOGLE_ADS) {
      return BillingCycle.ONE_TIME;
    }

    return BillingCycle.ANNUAL;
  }

  private buildServiceMetadata(service: ServiceRecord): Prisma.InputJsonObject {
    return {
      amount: service.amount?.toString() ?? null,
      billingCycle: service.billingCycle,
      currencyCode: service.currencyCode,
      provider: service.provider,
      renewalDate: service.nextRenewalAt?.toISOString() ?? null,
      serviceType: service.serviceType,
      status: service.technicalStatus,
    };
  }

  private toResponse(service: ServiceRecord): ServiceResponseDto {
    return {
      amount: service.amount?.toString() ?? null,
      billingCycle: service.billingCycle,
      category: service.category,
      clientId: service.clientId,
      createdAt: service.createdAt,
      currencyCode: service.currencyCode,
      id: service.id,
      name: service.name,
      notes: service.notes,
      provider: service.provider,
      renewalDate: service.nextRenewalAt,
      serviceType: service.serviceType,
      status: service.technicalStatus,
      updatedAt: service.updatedAt,
    };
  }
}
