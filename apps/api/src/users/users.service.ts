import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HistoryEventType, Prisma, UserRole, UserStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateClientUserDto } from './dto/create-client-user.dto';
import { UpdateClientUserDto } from './dto/update-client-user.dto';

const clientUserSelect = {
  clientId: true,
  createdAt: true,
  email: true,
  fullName: true,
  id: true,
  phone: true,
  role: true,
  status: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type ClientUserRecord = Prisma.UserGetPayload<{
  select: typeof clientUserSelect;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createClientUser(
    clientId: string,
    createClientUserDto: CreateClientUserDto,
    actorUserId: string,
  ): Promise<ClientUserRecord> {
    await this.ensureClientExists(clientId);

    try {
      return await this.prisma.$transaction(async (transaction) => {
        const user = await transaction.user.create({
          data: {
            clientId,
            email: createClientUserDto.email,
            fullName: createClientUserDto.fullName,
            phone: createClientUserDto.phone,
            role: UserRole.CLIENT,
            status: createClientUserDto.status ?? UserStatus.ACTIVE,
          },
          select: clientUserSelect,
        });

        await transaction.historyEvent.create({
          data: {
            actorUserId,
            clientId,
            eventType: HistoryEventType.USER_CREATED,
            title: 'Client user created',
            description: `Client user "${user.email}" was created.`,
            metadata: {
              userId: user.id,
              role: user.role,
              status: user.status,
            },
          },
        });

        return user;
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findClientUsers(clientId: string): Promise<ClientUserRecord[]> {
    await this.ensureClientExists(clientId);

    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: clientUserSelect,
      where: {
        clientId,
        role: UserRole.CLIENT,
      },
    });
  }

  async findClientUser(id: string): Promise<ClientUserRecord> {
    const user = await this.prisma.user.findFirst({
      select: clientUserSelect,
      where: {
        id,
        role: UserRole.CLIENT,
      },
    });

    if (!user) {
      throw new NotFoundException('Client user was not found.');
    }

    return user;
  }

  async updateClientUser(
    id: string,
    updateClientUserDto: UpdateClientUserDto,
  ): Promise<ClientUserRecord> {
    await this.findClientUser(id);

    try {
      return await this.prisma.user.update({
        data: {
          email: updateClientUserDto.email,
          fullName: updateClientUserDto.fullName,
          phone: updateClientUserDto.phone,
          status: updateClientUserDto.status,
        },
        select: clientUserSelect,
        where: {
          id,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async deactivateClientUser(
    id: string,
    actorUserId: string,
  ): Promise<ClientUserRecord> {
    const existingUser = await this.findClientUser(id);

    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.update({
        data: {
          status: UserStatus.INACTIVE,
        },
        select: clientUserSelect,
        where: {
          id,
        },
      });

      await transaction.historyEvent.create({
        data: {
          actorUserId,
          clientId: existingUser.clientId,
          eventType: HistoryEventType.USER_DEACTIVATED,
          title: 'Client user deactivated',
          description: `Client user "${user.email}" was deactivated.`,
          metadata: {
            previousStatus: existingUser.status,
            userId: user.id,
          },
        },
      });

      return user;
    });
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

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('A user with the same email already exists.');
    }

    throw error;
  }
}
