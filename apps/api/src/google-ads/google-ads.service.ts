import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BillingCycle,
  GoogleAdsAccount,
  GoogleAdsConsumption,
  GoogleAdsDailyMovement,
  GoogleAdsStatus,
  GoogleAdsTopUp,
  HistoryEventType,
  Prisma,
  ServiceCategory,
  ServiceTechnicalStatus,
  ServiceType,
} from '@prisma/client';
import type { Client } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateGoogleAdsAccountDto } from './dto/create-google-ads-account.dto';
import { CreateGoogleAdsConsumptionDto } from './dto/create-google-ads-consumption.dto';
import { CreateGoogleAdsDailyMovementDto } from './dto/create-google-ads-daily-movement.dto';
import { CreateGoogleAdsTopUpDto } from './dto/create-google-ads-top-up.dto';
import { GoogleAdsAccountResponseDto } from './dto/google-ads-account-response.dto';
import { GoogleAdsClientAccountDetailResponseDto } from './dto/google-ads-client-account-detail-response.dto';
import { GoogleAdsClientAccountResponseDto } from './dto/google-ads-client-account-response.dto';
import { GoogleAdsClientDailyMovementResponseDto } from './dto/google-ads-client-daily-movement-response.dto';
import { GoogleAdsClientSummaryResponseDto } from './dto/google-ads-client-summary-response.dto';
import { GoogleAdsConsumptionResponseDto } from './dto/google-ads-consumption-response.dto';
import { GoogleAdsDailyMovementAdminResponseDto } from './dto/google-ads-daily-movement-admin-response.dto';
import { GoogleAdsDailyMovementClientResponseDto } from './dto/google-ads-daily-movement-client-response.dto';
import { GoogleAdsTopUpResponseDto } from './dto/google-ads-top-up-response.dto';
import { UpdateGoogleAdsAccountDto } from './dto/update-google-ads-account.dto';

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

const dailyMovementInclude = {
  client: {
    select: {
      name: true,
    },
  },
  googleAdsAccount: {
    select: {
      accountName: true,
      cpcMultiplier: true,
    },
  },
} satisfies Prisma.GoogleAdsDailyMovementInclude;

type DailyMovementRecord = Prisma.GoogleAdsDailyMovementGetPayload<{
  include: typeof dailyMovementInclude;
}>;

@Injectable()
export class GoogleAdsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(
    createAccountDto: CreateGoogleAdsAccountDto,
    actorUserId: string,
  ): Promise<GoogleAdsAccountResponseDto> {
    await this.ensureClientExists(createAccountDto.clientId);
    const historyActorUserId = await this.resolveHistoryActorUserId(actorUserId);
    const cpcMultiplier = createAccountDto.cpcMultiplier
      ? this.parsePositiveDecimal(
          createAccountDto.cpcMultiplier,
          'CPC multiplier',
        )
      : undefined;

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
            cpcMultiplier,
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
            actorUserId: historyActorUserId,
            clientId: createdAccount.clientId,
            eventType: HistoryEventType.SERVICE_CREATED,
            googleAdsAccountId: createdAccount.id,
            serviceId: createdAccount.serviceId,
            title: 'Google Ads account created',
            description: `Google Ads account "${createdAccount.accountName}" was created.`,
            metadata: {
              currencyCode: createdAccount.currencyCode,
              cpcMultiplier: createdAccount.cpcMultiplier.toString(),
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

  async getClientSummary(
    clientId: string,
  ): Promise<GoogleAdsClientSummaryResponseDto> {
    await this.ensureClientExists(clientId);
    const { periodEnd, periodStart } = this.getCurrentMonthRange();

    const [accounts, periodAggregate] = await Promise.all([
      this.prisma.googleAdsAccount.findMany({
        where: {
          clientId,
        },
      }),
      this.prisma.googleAdsDailyMovement.aggregate({
        _sum: {
          clicks: true,
          consumption: true,
          conversions: true,
          topUp: true,
        },
        where: {
          clientId,
          movementDate: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
      }),
    ]);

    const accountSummaries = await Promise.all(
      accounts.map((account) => this.getWalletSummary(account.id)),
    );
    const balance = accountSummaries.reduce(
      (total, summary) => total.plus(summary.balance),
      new Prisma.Decimal(0),
    );

    return {
      activeAccounts: accounts.filter(
        (account) => account.status === GoogleAdsStatus.ACTIVE,
      ).length,
      balance: balance.toString(),
      clientId,
      currencyCode: accounts[0]?.currencyCode ?? 'COP',
      monthClicks: periodAggregate._sum.clicks ?? 0,
      monthConsumption: (
        periodAggregate._sum.consumption ?? new Prisma.Decimal(0)
      ).toString(),
      monthConversions: periodAggregate._sum.conversions ?? 0,
      monthTopUps: (
        periodAggregate._sum.topUp ?? new Prisma.Decimal(0)
      ).toString(),
      periodEnd,
      periodStart,
    };
  }

  async findClientAccounts(
    clientId: string,
  ): Promise<GoogleAdsClientAccountResponseDto[]> {
    await this.ensureClientExists(clientId);

    const accounts = await this.prisma.googleAdsAccount.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        clientId,
      },
    });

    return Promise.all(
      accounts.map(async (account) =>
        this.toClientAccountResponse(
          account,
          await this.getWalletSummary(account.id),
        ),
      ),
    );
  }

  async findClientAccountDetail(
    clientId: string,
    accountId: string,
  ): Promise<GoogleAdsClientAccountDetailResponseDto> {
    await this.ensureClientExists(clientId);
    const { periodEnd, periodStart } = this.getCurrentMonthRange();
    const account = await this.prisma.googleAdsAccount.findFirst({
      where: {
        clientId,
        id: accountId,
      },
    });

    if (!account) {
      throw new NotFoundException('Google Ads account was not found.');
    }

    const [summary, periodAggregate, movements] = await Promise.all([
      this.getWalletSummary(account.id),
      this.prisma.googleAdsDailyMovement.aggregate({
        _sum: {
          clicks: true,
          consumption: true,
          conversions: true,
          topUp: true,
        },
        where: {
          googleAdsAccountId: account.id,
          movementDate: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
      }),
      this.prisma.googleAdsDailyMovement.findMany({
        orderBy: {
          movementDate: 'desc',
        },
        where: {
          googleAdsAccountId: account.id,
          movementDate: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
      }),
    ]);

    return {
      accountName: account.accountName,
      balance: summary.balance.toString(),
      clicks: periodAggregate._sum.clicks ?? 0,
      consumption: (
        periodAggregate._sum.consumption ?? new Prisma.Decimal(0)
      ).toString(),
      conversions: periodAggregate._sum.conversions ?? 0,
      currencyCode: account.currencyCode,
      customerId: account.externalCustomerId,
      id: account.id,
      movements: movements.map((movement) =>
        this.toClientVisibleDailyMovementResponse(movement),
      ),
      periodEnd,
      periodStart,
      status: account.status,
      topUp: (periodAggregate._sum.topUp ?? new Prisma.Decimal(0)).toString(),
    };
  }

  async findDevelopmentClient(clientId?: string): Promise<Client | null> {
    if (clientId) {
      if (!this.isUuid(clientId)) {
        throw new BadRequestException('DEV client ID must be a valid UUID.');
      }

      const client = await this.prisma.client.findUnique({
        where: {
          id: clientId,
        },
      });

      if (!client) {
        throw new NotFoundException('Client was not found.');
      }

      return client;
    }

    const clientWithGoogleAds = await this.prisma.client.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        googleAdsAccounts: {
          some: {},
        },
      },
    });

    return (
      clientWithGoogleAds ??
      this.prisma.client.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      })
    );
  }

  async findAccount(id: string): Promise<GoogleAdsAccountResponseDto> {
    const account = await this.findAccountOrThrow(id);
    return this.toAccountResponse(account, await this.getWalletSummary(id));
  }

  async updateAccount(
    id: string,
    updateAccountDto: UpdateGoogleAdsAccountDto,
    actorUserId: string,
  ): Promise<GoogleAdsAccountResponseDto> {
    const account = await this.findAccountOrThrow(id);
    const data: Prisma.GoogleAdsAccountUpdateInput = {};
    const serviceData: Prisma.ServiceUpdateInput = {};
    const changedFields: string[] = [];

    if (updateAccountDto.accountName !== undefined) {
      data.accountName = updateAccountDto.accountName;
      serviceData.name = updateAccountDto.accountName;
      changedFields.push('accountName');
    }

    if (updateAccountDto.customerId !== undefined) {
      data.externalCustomerId = updateAccountDto.customerId || null;
      changedFields.push('customerId');
    }

    if (updateAccountDto.status !== undefined) {
      data.status = updateAccountDto.status;
      changedFields.push('status');
    }

    if (updateAccountDto.currencyCode !== undefined) {
      data.currencyCode = updateAccountDto.currencyCode;
      serviceData.currencyCode = updateAccountDto.currencyCode;
      changedFields.push('currencyCode');
    }

    if (updateAccountDto.cpcMultiplier !== undefined) {
      data.cpcMultiplier = this.parsePositiveDecimal(
        updateAccountDto.cpcMultiplier,
        'CPC multiplier',
      );
      changedFields.push('cpcMultiplier');
    }

    if (updateAccountDto.notes !== undefined) {
      data.notes = updateAccountDto.notes;
      serviceData.notes = updateAccountDto.notes;
      changedFields.push('notes');
    }

    try {
      const updatedAccount = await this.prisma.$transaction(
        async (transaction) => {
          if (Object.keys(serviceData).length > 0) {
            await transaction.service.update({
              data: serviceData,
              where: {
                id: account.serviceId,
              },
            });
          }

          const updated = await transaction.googleAdsAccount.update({
            data,
            include: accountInclude,
            where: {
              id: account.id,
            },
          });

          await transaction.historyEvent.create({
            data: {
              actorUserId,
              clientId: updated.clientId,
              eventType: HistoryEventType.GOOGLE_ADS_ACCOUNT_UPDATED,
              googleAdsAccountId: updated.id,
              serviceId: updated.serviceId,
              title: 'Google Ads account updated',
              description: `Google Ads account "${updated.accountName}" was updated.`,
              metadata: {
                changedFields,
                cpcMultiplier: updated.cpcMultiplier.toString(),
                currencyCode: updated.currencyCode,
                customerId: updated.externalCustomerId,
                status: updated.status,
              },
            },
          });

          return updated;
        },
      );

      return this.toAccountResponse(
        updatedAccount,
        await this.getWalletSummary(updatedAccount.id),
      );
    } catch (error) {
      this.handlePrismaError(error);
    }
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

  async registerDailyMovement(
    accountId: string,
    createMovementDto: CreateGoogleAdsDailyMovementDto,
    actorUserId: string,
  ): Promise<GoogleAdsDailyMovementAdminResponseDto> {
    const account = await this.findAccountOrThrow(accountId);
    const movementDate = this.toDateOnly(createMovementDto.movementDate);
    const cpcCost = this.parsePositiveDecimal(
      createMovementDto.cpcCost,
      'CPC cost',
    );
    const consumption = this.parseOptionalNonNegativeDecimal(
      createMovementDto.consumption,
      'Consumption',
    );
    const topUp = this.parseOptionalNonNegativeDecimal(
      createMovementDto.topUp,
      'Top-up',
    );
    const requestedBalance =
      createMovementDto.balance !== undefined
        ? this.parseDecimal(createMovementDto.balance, 'Balance')
        : undefined;
    const cpcSale = cpcCost.times(account.cpcMultiplier);

    try {
      const movement = await this.prisma.$transaction(async (transaction) => {
        const previousMovement = await transaction.googleAdsDailyMovement.findFirst({
          orderBy: {
            movementDate: 'desc',
          },
          select: {
            balance: true,
          },
          where: {
            googleAdsAccountId: account.id,
            movementDate: {
              lt: movementDate,
            },
          },
        });

        const balance =
          requestedBalance ??
          (previousMovement?.balance ?? new Prisma.Decimal(0))
            .plus(topUp)
            .minus(consumption);

        const createdMovement =
          await transaction.googleAdsDailyMovement.create({
            data: {
              balance,
              clientId: account.clientId,
              clicks: createMovementDto.clicks ?? 0,
              consumption,
              conversions: createMovementDto.conversions ?? 0,
              cpcCost,
              cpcSale,
              createdByUserId: actorUserId,
              currencyCode: account.currencyCode,
              googleAdsAccountId: account.id,
              movementDate,
              notes: createMovementDto.notes,
              topUp,
            },
            include: dailyMovementInclude,
          });

        await transaction.historyEvent.create({
          data: {
            actorUserId,
            clientId: account.clientId,
            eventType: HistoryEventType.GOOGLE_ADS_DAILY_MOVEMENT_REGISTERED,
            googleAdsAccountId: account.id,
            googleAdsDailyMovementId: createdMovement.id,
            serviceId: account.serviceId,
            title: 'Google Ads daily movement registered',
            description: `Daily movement registered for "${account.accountName}".`,
            metadata: {
              balance: createdMovement.balance.toString(),
              clicks: createdMovement.clicks,
              consumption: createdMovement.consumption.toString(),
              conversions: createdMovement.conversions,
              cpcCost: createdMovement.cpcCost.toString(),
              cpcMultiplier: account.cpcMultiplier.toString(),
              cpcSale: createdMovement.cpcSale.toString(),
              movementDate: createdMovement.movementDate.toISOString(),
              topUp: createdMovement.topUp.toString(),
            },
          },
        });

        return createdMovement;
      });

      return this.toAdminDailyMovementResponse(movement);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findDailyMovements(
    accountId: string,
  ): Promise<GoogleAdsDailyMovementAdminResponseDto[]> {
    await this.findAccountOrThrow(accountId);

    const movements = await this.prisma.googleAdsDailyMovement.findMany({
      include: dailyMovementInclude,
      orderBy: {
        movementDate: 'desc',
      },
      where: {
        googleAdsAccountId: accountId,
      },
    });

    return movements.map((movement) =>
      this.toAdminDailyMovementResponse(movement),
    );
  }

  async findClientDailyMovements(
    accountId: string,
  ): Promise<GoogleAdsDailyMovementClientResponseDto[]> {
    await this.findAccountOrThrow(accountId);

    const movements = await this.prisma.googleAdsDailyMovement.findMany({
      orderBy: {
        movementDate: 'desc',
      },
      where: {
        googleAdsAccountId: accountId,
      },
    });

    return movements.map((movement) =>
      this.toClientDailyMovementResponse(movement),
    );
  }

  private async resolveHistoryActorUserId(
    actorUserId: string,
  ): Promise<string | null> {
    if (!this.isUuid(actorUserId)) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        id: actorUserId,
      },
    });

    return user?.id ?? null;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
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
    const [
      topUpAggregate,
      consumptionAggregate,
      latestTopUp,
      latestConsumption,
      latestMovement,
      latestMovementTopUp,
      latestMovementConsumption,
      movementAggregate,
    ] = await Promise.all([
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
      this.prisma.googleAdsDailyMovement.findFirst({
        orderBy: {
          movementDate: 'desc',
        },
        where: {
          googleAdsAccountId: accountId,
        },
      }),
      this.prisma.googleAdsDailyMovement.findFirst({
        orderBy: {
          movementDate: 'desc',
        },
        where: {
          googleAdsAccountId: accountId,
          topUp: {
            gt: 0,
          },
        },
      }),
      this.prisma.googleAdsDailyMovement.findFirst({
        orderBy: {
          movementDate: 'desc',
        },
        where: {
          consumption: {
            gt: 0,
          },
          googleAdsAccountId: accountId,
        },
      }),
      this.prisma.googleAdsDailyMovement.aggregate({
        _sum: {
          clicks: true,
          conversions: true,
        },
        where: {
          googleAdsAccountId: accountId,
        },
      }),
    ]);

    const totalTopUps = topUpAggregate._sum.amount ?? new Prisma.Decimal(0);
    const totalConsumptions =
      consumptionAggregate._sum.amount ?? new Prisma.Decimal(0);
    const legacyBalance = totalTopUps.minus(totalConsumptions);

    return {
      balance: latestMovement?.balance ?? legacyBalance,
      clicks: movementAggregate._sum.clicks ?? 0,
      conversions: movementAggregate._sum.conversions ?? 0,
      latestConsumptionAmount:
        latestMovementConsumption?.consumption ??
        latestConsumption?.amount ??
        null,
      latestConsumptionAt:
        latestMovementConsumption?.movementDate ??
        latestConsumption?.consumedAt ??
        null,
      latestMovement,
      latestTopUpAmount: latestMovementTopUp?.topUp ?? latestTopUp?.amount ?? null,
      latestTopUpAt:
        latestMovementTopUp?.movementDate ?? latestTopUp?.toppedUpAt ?? null,
      totalConsumptions,
      totalTopUps,
    };
  }

  private parsePositiveAmount(value: string): Prisma.Decimal {
    return this.parsePositiveDecimal(value, 'Amount');
  }

  private parsePositiveDecimal(
    value: string,
    label: string,
  ): Prisma.Decimal {
    const amount = this.parseDecimal(value, label);

    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException(`${label} must be greater than zero.`);
    }

    return amount;
  }

  private parseOptionalNonNegativeDecimal(
    value: string | undefined,
    label: string,
  ): Prisma.Decimal {
    if (value === undefined) {
      return new Prisma.Decimal(0);
    }

    const amount = this.parseDecimal(value, label);

    if (amount.lessThan(0)) {
      throw new BadRequestException(`${label} cannot be negative.`);
    }

    return amount;
  }

  private parseDecimal(value: string, label: string): Prisma.Decimal {
    try {
      return new Prisma.Decimal(value);
    } catch {
      throw new BadRequestException(`${label} must be a valid decimal value.`);
    }
  }

  private toDateOnly(value: Date): Date {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }

  private getCurrentMonthRange(): { periodEnd: Date; periodStart: Date } {
    const now = new Date();
    const periodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const periodEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    return {
      periodEnd,
      periodStart,
    };
  }

  private toAccountResponse(
    account: AccountRecord,
    summary: Awaited<ReturnType<GoogleAdsService['getWalletSummary']>>,
  ): GoogleAdsAccountResponseDto {
    return {
      accountName: account.accountName,
      balance: summary.balance.toString(),
      clicks: summary.clicks,
      clientId: account.clientId,
      clientName: account.client.name,
      createdAt: account.createdAt,
      conversions: summary.conversions,
      cpcMultiplier: account.cpcMultiplier.toString(),
      currencyCode: account.currencyCode,
      customerId: account.externalCustomerId,
      id: account.id,
      lastConsumptionAmount:
        summary.latestConsumptionAmount?.toString() ?? null,
      lastConsumptionAt: summary.latestConsumptionAt,
      lastTopUpAmount: summary.latestTopUpAmount?.toString() ?? null,
      lastTopUpAt: summary.latestTopUpAt,
      latestMovementCpcSale:
        summary.latestMovement?.cpcSale.toString() ?? null,
      latestMovementDate: summary.latestMovement?.movementDate ?? null,
      notes: account.notes,
      serviceId: account.serviceId,
      status: account.status,
      totalConsumptions: summary.totalConsumptions.toString(),
      totalTopUps: summary.totalTopUps.toString(),
      updatedAt: account.updatedAt,
    };
  }

  private toClientAccountResponse(
    account: GoogleAdsAccount,
    summary: Awaited<ReturnType<GoogleAdsService['getWalletSummary']>>,
  ): GoogleAdsClientAccountResponseDto {
    return {
      accountName: account.accountName,
      balance: summary.balance.toString(),
      clicks: summary.clicks,
      conversions: summary.conversions,
      currencyCode: account.currencyCode,
      customerId: account.externalCustomerId,
      id: account.id,
      latestMovementDate: summary.latestMovement?.movementDate ?? null,
      status: account.status,
    };
  }

  private toAdminDailyMovementResponse(
    movement: DailyMovementRecord,
  ): GoogleAdsDailyMovementAdminResponseDto {
    return {
      accountName: movement.googleAdsAccount.accountName,
      balance: movement.balance.toString(),
      clicks: movement.clicks,
      clientId: movement.clientId,
      clientName: movement.client.name,
      consumption: movement.consumption.toString(),
      conversions: movement.conversions,
      cpcCost: movement.cpcCost.toString(),
      cpcMultiplier: movement.googleAdsAccount.cpcMultiplier.toString(),
      cpcSale: movement.cpcSale.toString(),
      createdAt: movement.createdAt,
      currencyCode: movement.currencyCode,
      googleAdsAccountId: movement.googleAdsAccountId,
      id: movement.id,
      movementDate: movement.movementDate,
      notes: movement.notes,
      topUp: movement.topUp.toString(),
      updatedAt: movement.updatedAt,
    };
  }

  private toClientVisibleDailyMovementResponse(
    movement: GoogleAdsDailyMovement,
  ): GoogleAdsClientDailyMovementResponseDto {
    return {
      balance: movement.balance.toString(),
      clicks: movement.clicks,
      consumption: movement.consumption.toString(),
      conversions: movement.conversions,
      cpc: movement.cpcSale.toString(),
      movementDate: movement.movementDate,
      topUp: movement.topUp.toString(),
    };
  }

  private toClientDailyMovementResponse(
    movement: GoogleAdsDailyMovement,
  ): GoogleAdsDailyMovementClientResponseDto {
    return {
      balance: movement.balance.toString(),
      clicks: movement.clicks,
      consumption: movement.consumption.toString(),
      conversions: movement.conversions,
      cpc: movement.cpcSale.toString(),
      currencyCode: movement.currencyCode,
      googleAdsAccountId: movement.googleAdsAccountId,
      id: movement.id,
      movementDate: movement.movementDate,
      notes: movement.notes,
      topUp: movement.topUp.toString(),
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
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(',')
        : String(error.meta?.target ?? '');

      if (
        target.includes('googleAdsAccountId') &&
        target.includes('movementDate')
      ) {
        throw new ConflictException(
          'A Google Ads daily movement already exists for this account and date.',
        );
      }

      throw new ConflictException(
        'A Google Ads account with the same customer ID already exists.',
      );
    }

    throw error;
  }
}
