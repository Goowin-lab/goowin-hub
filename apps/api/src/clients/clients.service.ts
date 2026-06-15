import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client, HistoryEventType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ChangeClientCommercialStatusDto } from './dto/change-client-commercial-status.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createClientDto: CreateClientDto,
    actorUserId: string,
  ): Promise<Client> {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const client = await transaction.client.create({
          data: {
            billingEmail: createClientDto.billingEmail,
            commercialStatus: createClientDto.commercialStatus,
            legalName: createClientDto.legalName,
            name: createClientDto.name,
            notes: createClientDto.notes,
            phone: createClientDto.phone,
            taxId: createClientDto.taxId,
          },
        });

        await transaction.historyEvent.create({
          data: {
            actorUserId,
            clientId: client.id,
            eventType: HistoryEventType.CLIENT_CREATED,
            title: 'Client created',
            description: `Client "${client.name}" was created.`,
            metadata: {
              commercialStatus: client.commercialStatus,
              taxId: client.taxId,
            },
          },
        });

        return client;
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(): Promise<Client[]> {
    return this.prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: {
        id,
      },
    });

    if (!client) {
      throw new NotFoundException('Client was not found.');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    await this.findOne(id);

    try {
      return await this.prisma.client.update({
        data: {
          billingEmail: updateClientDto.billingEmail,
          commercialStatus: updateClientDto.commercialStatus,
          legalName: updateClientDto.legalName,
          name: updateClientDto.name,
          notes: updateClientDto.notes,
          phone: updateClientDto.phone,
          taxId: updateClientDto.taxId,
        },
        where: {
          id,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async changeCommercialStatus(
    id: string,
    changeClientCommercialStatusDto: ChangeClientCommercialStatusDto,
    actorUserId: string,
  ): Promise<Client> {
    const existingClient = await this.findOne(id);
    const nextStatus = changeClientCommercialStatusDto.commercialStatus;

    return this.prisma.$transaction(async (transaction) => {
      const client = await transaction.client.update({
        data: {
          commercialStatus: nextStatus,
        },
        where: {
          id,
        },
      });

      await transaction.historyEvent.create({
        data: {
          actorUserId,
          clientId: client.id,
          eventType: HistoryEventType.CLIENT_STATUS_CHANGED,
          title: 'Client commercial status changed',
          description: `Client "${client.name}" changed commercial status.`,
          metadata: {
            previousStatus: existingClient.commercialStatus,
            nextStatus,
          },
        },
      });

      return client;
    });
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A client with the same unique information already exists.',
      );
    }

    throw error;
  }
}
