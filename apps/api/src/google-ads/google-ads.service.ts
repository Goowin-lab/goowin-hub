import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BillingCycle,
  GoogleAdsConsumption,
  GoogleAdsStatus,
  GoogleAdsTopUp,
  HistoryEventType,
  Prisma,
  ServiceCategory,
  ServiceTechnicalStatus,
  ServiceType,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateGoogleAdsAccountDto } from './dto/create-google-ads-account.dto';
import { CreateGoogleAdsConsumptionDto } from './dto/create-google-ads-consumption.dto';
import { CreateGoogleAdsTopUpDto } from './dto/create-google-ads-top-up.dto';
import { GoogleAdsAccountResponseDto } from './dto/google-ads-account-response.dto';
import { GoogleAdsConsumptionResponseDto } from './dto/google-ads-consumption-response.dto';
import { GoogleAdsTopUpResponseDto } from './dto/google-ads-top-up-response.dto';

const accountInclude = {
  client: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.GoogleAdsAccountInclude;

type AccountRecord = Prisma.GoogleAdsAccountGetPayload<{
  include: typeof accountInclude;
}>;

@Injectable()
export class GoogleAdsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(
    createAccountDto: CreateGoogleAdsAccountDto,
    actorUserId: string,
  ): Promise<GoogleAdsAccountResponseDto> {
    await this.ensureClientExists(createAccountDto.clientId);

    try {
      const account = await this.prisma.$transaction(async (transaction) => {
        const service = await transaction.service.create({
          data: {
            billingCycle: BillingCycle.ONE_TIME,
            category: ServiceCategory.PREPAID,
            clientId: createAccountDto.clientId,
            currencyCode: createAccountDto.currencyCode ?? 'COP',
            name: createAccountDto.accountName,
            notes: createAccountDto.notes,
            serviceType: ServiceType.GOOGLE_ADS,
            technicalStatus: ServiceTechnicalStatus.ACTIVE,
          },
          select: {
            id: true,
          },
        });

        const createdAccount = await transaction.googleAdsAccount.create({
          data: {
            accountName: createAccountDto.accountName,
            clientId: createAccountDto.clientId,
            currencyCode: createAccountDto.currencyCode ?? 'COP',
            externalCustomerId: createAccountDto.customerId,
            notes: createAccountDto.notes,
            serviceId: service.id,
            status: createAccountDto.status ?? GoogleAdsStatus.ACTIVE,
          },
          include: accountInclude,
        });

        await transaction.historyEvent.create({
          data: {
            actorUserId,
            clientId: createdAccount.clientId,
            eventType: HistoryEventType.SERVICE_CREATED,
            googleAdsAccountId: createdAccount.id,
            serviceId: createdAccount.serviceId,
            title: 'Google Ads account created',
            description: `Google Ads account "${createdAccount.accountName}" was created.`,
            metadata: {
              currencyCode: createdAccount.currencyCode,
              customerId: createdAccount.externalCustomerId,
              status: createdAccount.status,
            },
          },
        });

        return createdAccount;
      });

      return this.toAccountResponse(account, await this.getWalletSummary(account.id));
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAccounts(): Promise<GoogleAdsAccountResponseDto[]> {
    const accounts = await this.prisma.googleAdsAccount.findMany({
      include: accountInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(
      accounts.map(async (account) =>
        this.toAccountResponse(account, await this.getWalletSummary(account.id)),
      ),
    );
  }

  async findAccountsByClient(
    clientId: string,
  ): Promise<GoogleAdsAccountResponseDto[]> {
    await this.ensureClientExists(clientId);

    const accounts = await this.prisma.googleAdsAccount.findMany({
      include: accountInclude,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        clientId,
      },
    });

    return Promise.all(
      accounts.map(async (account) =>
        this.toAccountResponse(account, await this.getWalletSummary(account.id)),
      ),
    );
  }

  async findAccount(id: string): Promise<GoogleAdsAccountResponseDto> {
    const account = await this.findAccountOrThrow(id);
    return this.toAccountResponse(account, await this.getWalletSummary(id));
  }

  async registerTopUp(
    accountId: string,
    createTopUpDto: CreateGoogleAdsTopUpDto,
    actorUserId: string,
  ): Promise<GoogleAdsTopUpResponseDto> {
    const account = await this.findAccountOrThrow(accountId);
    const amount = this.parsePositiveAmount(createTopUpDto.amount);

    const topUp = await this.prisma.$transaction(async (transaction) => {
      const createdTopUp = await transaction.googleAdsTopUp.create({
        data: {
          amount,
          clientId: account.clientId,
          createdByUserId: actorUserId,
          currencyCode: account.currencyCode,
          googleAdsAccountId: account.id,
          notes: createTopUpDto.notes,
          reference: createTopUpDto.reference,
          toppedUpAt: createTopUpDto.toppedUpAt,
        },
      });

      await transaction.googleAdsAccount.update({
        data: {
          lastTopUpAt: createdTopUp.toppedUpAt,
        },
        where: {
          id: account.id,
        },
      });

      await transaction.historyEvent.create({
        data: {
          actorUserId,
          clientId: account.clientId,
          eventType: HistoryEventType.GOOGLE_ADS_TOP_UP_REGISTERED,
          googleAdsAccountId: account.id,
          googleAdsTopUpId: createdTopUp.id,
          serviceId: account.serviceId,
          title: 'Google Ads top-up registered',
          description: `Top-up registered for "${account.accountName}".`,
          metadata: {
            amount: createdTopUp.amount.toString(),
            currencyCode: createdTopUp.currencyCode,
            toppedUpAt: createdTopUp.toppedUpAt.toISOString(),
          },
        },
      });

      return createdTopUp;
    });

    return this.toTopUpResponse(topUp);
  }

  async findTopUps(accountId: string): Promise<GoogleAdsTopUpResponseDto[]> {
    await this.findAccountOrThrow(accountId);

    const topUps = await this.prisma.googleAdsTopUp.findMany({
      orderBy: {
        toppedUpAt: 'desc',
      },
      where: {
        googleAdsAccountId: accountId,
      },
    });

    return topUps.map((topUp) => this.toTopUpResponse(topUp));
  }

  async registerConsumption(
    accountId: string,
    createConsumptionDto: CreateGoogleAdsConsumptionDto,
    actorUserId: string,
  ): Promise<GoogleAdsConsumptionResponseDto> {
    const account = await this.findAccountOrThrow(accountId);
    const amount = this.parsePositiveAmount(createConsumptionDto.amount);

    const consumption = await this.prisma.$transaction(async (transaction) => {
      const createdConsumption =
        await transaction.googleAdsConsumption.create({
          data: {
            amount,
            clientId: account.clientId,
            consumedAt: createConsumptionDto.consumedAt,
            currencyCode: account.currencyCode,
            description: createConsumptionDto.notes,
            googleAdsAccountId: account.id,
          },
        });

      await transaction.googleAdsAccount.update({
        data: {
          lastConsumptionAt: createdConsumption.consumedAt,
        },
        where: {
          id: account.id,
        },
      });

      await transaction.historyEvent.create({
        data: {
          actorUserId,
          clientId: account.clientId,
          eventType: HistoryEventType.GOOGLE_ADS_CONSUMPTION_REGISTERED,
          googleAdsAccountId: account.id,
          googleAdsConsumptionId: createdConsumption.id,
          serviceId: account.serviceId,
          title: 'Google Ads consumption registered',
          description: `Consumption registered for "${account.accountName}".`,
          metadata: {
            amount: createdConsumption.amount.toString(),
            consumedAt: createdConsumption.consumedAt.toISOString(),
            currencyCode: createdConsumption.currencyCode,
          },
        },
      });

      return createdConsumption;
    });

    return this.toConsumptionResponse(consumption);
  }

  async findConsumptions(
    accountId: string,
  ): Promise<GoogleAdsConsumptionResponseDto[]> {
    await this.findAccountOrThrow(accountId);

    const consumptions = await this.prisma.googleAdsConsumption.findMany({
      orderBy: {
        consumedAt: 'desc',
      },
      where: {
        googleAdsAccountId: accountId,
      },
    });

    return consumptions.map((consumption) =>
      this.toConsumptionResponse(consumption),
    );
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

  private async findAccountOrThrow(id: string): Promise<AccountRecord> {
    const account = await this.prisma.googleAdsAccount.findUnique({
      include: accountInclude,
      where: {
        id,
      },
    });

    if (!account) {
      throw new NotFoundException('Google Ads account was not found.');
    }

    return account;
  }

  private async getWalletSummary(accountId: string) {
    const [topUpAggregate, consumptionAggregate, latestTopUp, latestConsumption] =
      await Promise.all([
        this.prisma.googleAdsTopUp.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            googleAdsAccountId: accountId,
          },
        }),
        this.prisma.googleAdsConsumption.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            googleAdsAccountId: accountId,
          },
        }),
        this.prisma.googleAdsTopUp.findFirst({
          orderBy: {
            toppedUpAt: 'desc',
          },
          where: {
            googleAdsAccountId: accountId,
          },
        }),
        this.prisma.googleAdsConsumption.findFirst({
          orderBy: {
            consumedAt: 'desc',
          },
          where: {
            googleAdsAccountId: accountId,
          },
        }),
      ]);

    const totalTopUps = topUpAggregate._sum.amount ?? new Prisma.Decimal(0);
    const totalConsumptions =
      consumptionAggregate._sum.amount ?? new Prisma.Decimal(0);

    return {
      balance: totalTopUps.minus(totalConsumptions),
      latestConsumption,
      latestTopUp,
      totalConsumptions,
      totalTopUps,
    };
  }

  private parsePositiveAmount(value: string): Prisma.Decimal {
    const amount = new Prisma.Decimal(value);

    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be greater than zero.');
    }

    return amount;
  }

  private toAccountResponse(
    account: AccountRecord,
    summary: Awaited<ReturnType<GoogleAdsService['getWalletSummary']>>,
  ): GoogleAdsAccountResponseDto {
    return {
      accountName: account.accountName,
      balance: summary.balance.toString(),
      clientId: account.clientId,
      clientName: account.client.name,
      createdAt: account.createdAt,
      currencyCode: account.currencyCode,
      customerId: account.externalCustomerId,
      id: account.id,
      lastConsumptionAmount:
        summary.latestConsumption?.amount.toString() ?? null,
      lastConsumptionAt: summary.latestConsumption?.consumedAt ?? null,
      lastTopUpAmount: summary.latestTopUp?.amount.toString() ?? null,
      lastTopUpAt: summary.latestTopUp?.toppedUpAt ?? null,
      notes: account.notes,
      serviceId: account.serviceId,
      status: account.status,
      totalConsumptions: summary.totalConsumptions.toString(),
      totalTopUps: summary.totalTopUps.toString(),
      updatedAt: account.updatedAt,
    };
  }

  private toTopUpResponse(topUp: GoogleAdsTopUp): GoogleAdsTopUpResponseDto {
    return {
      amount: topUp.amount.toString(),
      clientId: topUp.clientId,
      createdAt: topUp.createdAt,
      currencyCode: topUp.currencyCode,
      googleAdsAccountId: topUp.googleAdsAccountId,
      id: topUp.id,
      notes: topUp.notes,
      reference: topUp.reference,
      toppedUpAt: topUp.toppedUpAt,
      updatedAt: topUp.updatedAt,
    };
  }

  private toConsumptionResponse(
    consumption: GoogleAdsConsumption,
  ): GoogleAdsConsumptionResponseDto {
    return {
      amount: consumption.amount.toString(),
      clientId: consumption.clientId,
      consumedAt: consumption.consumedAt,
      createdAt: consumption.createdAt,
      currencyCode: consumption.currencyCode,
      googleAdsAccountId: consumption.googleAdsAccountId,
      id: consumption.id,
      notes: consumption.description,
      updatedAt: consumption.updatedAt,
    };
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A Google Ads account with the same customer ID already exists.',
      );
    }

    throw error;
  }
}
