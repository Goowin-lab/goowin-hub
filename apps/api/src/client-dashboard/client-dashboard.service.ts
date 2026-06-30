import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ClientCommercialStatus,
  GoogleAdsStatus,
  InvoiceStatus,
  NotificationAudience,
  PaymentStatus,
  Prisma,
  RenewalStatus,
  ServiceCategory,
  ServiceTechnicalStatus,
} from '@prisma/client';
import type { Client } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import {
  ClientDashboardAccountStatus,
  ClientDashboardActivityDto,
  ClientDashboardActivityType,
  ClientDashboardResponseDto,
  ClientDashboardServiceDto,
} from './dto/client-dashboard-response.dto';

const UPCOMING_RENEWAL_DAYS = 45;

type DashboardClient = Pick<Client, 'commercialStatus' | 'id' | 'name'>;
type DevelopmentClientReference = Pick<Client, 'id' | 'name'>;

type GoogleAdsDashboardData = {
  balance: Prisma.Decimal;
  hasAccounts: boolean;
  hasActiveAccount: boolean;
};

type ActivityCandidate = ClientDashboardActivityDto & {
  sortDate: Date;
};

@Injectable()
export class ClientDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(clientId: string): Promise<ClientDashboardResponseDto> {
    this.assertUuid(clientId, 'Client ID');

    const client = await this.findClientOrThrow(clientId);
    const [
      activeServices,
      upcomingRenewals,
      pendingInvoices,
      notifications,
      googleAds,
      recentActivity,
    ] = await Promise.all([
      this.countActiveServices(client.id),
      this.countUpcomingRenewals(client.id),
      this.countPendingInvoices(client.id),
      this.countUnreadNotifications(client.id),
      this.getGoogleAdsDashboardData(client.id),
      this.getRecentActivity(client.id),
    ]);

    return {
      recentActivity,
      services: this.buildContractedServices(googleAds),
      summary: {
        accountStatus: this.toDashboardAccountStatus(client.commercialStatus),
        activeServices,
        googleAdsBalance: googleAds.balance.toString(),
        notifications,
        pendingInvoices,
        upcomingRenewals,
      },
    };
  }

  async findDevelopmentClient(
    clientId?: string,
  ): Promise<DevelopmentClientReference | null> {
    if (clientId) {
      this.assertUuid(clientId, 'DEV client ID');

      const client = await this.prisma.client.findUnique({
        select: {
          id: true,
          name: true,
        },
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
      select: {
        id: true,
        name: true,
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
        select: {
          id: true,
          name: true,
        },
      })
    );
  }

  private async findClientOrThrow(clientId: string): Promise<DashboardClient> {
    const client = await this.prisma.client.findUnique({
      select: {
        commercialStatus: true,
        id: true,
        name: true,
      },
      where: {
        id: clientId,
      },
    });

    if (!client) {
      throw new NotFoundException('Client was not found.');
    }

    return client;
  }

  private countActiveServices(clientId: string): Promise<number> {
    return this.prisma.service.count({
      where: {
        clientId,
        technicalStatus: ServiceTechnicalStatus.ACTIVE,
      },
    });
  }

  private countUpcomingRenewals(clientId: string): Promise<number> {
    const now = new Date();
    const renewalWindowEnd = new Date(
      now.getTime() + UPCOMING_RENEWAL_DAYS * 24 * 60 * 60 * 1000,
    );

    return this.prisma.service.count({
      where: {
        category: ServiceCategory.RECURRENT,
        clientId,
        OR: [
          {
            technicalStatus: ServiceTechnicalStatus.RENEWAL_SOON,
          },
          {
            nextRenewalAt: {
              gte: now,
              lte: renewalWindowEnd,
            },
          },
          {
            expiresAt: {
              gte: now,
              lte: renewalWindowEnd,
            },
          },
        ],
      },
    });
  }

  private countPendingInvoices(clientId: string): Promise<number> {
    return this.prisma.invoice.count({
      where: {
        clientId,
        status: {
          in: [
            InvoiceStatus.ISSUED,
            InvoiceStatus.PARTIALLY_PAID,
            InvoiceStatus.OVERDUE,
          ],
        },
      },
    });
  }

  private countUnreadNotifications(clientId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        audience: {
          in: [NotificationAudience.CLIENT, NotificationAudience.BOTH],
        },
        clientId,
        readAt: null,
      },
    });
  }

  private async getGoogleAdsDashboardData(
    clientId: string,
  ): Promise<GoogleAdsDashboardData> {
    const accounts = await this.prisma.googleAdsAccount.findMany({
      select: {
        id: true,
        status: true,
      },
      where: {
        clientId,
      },
    });

    const balances = await Promise.all(
      accounts.map((account) => this.getGoogleAdsAccountBalance(account.id)),
    );
    const balance = balances.reduce(
      (total, accountBalance) => total.plus(accountBalance),
      new Prisma.Decimal(0),
    );

    return {
      balance,
      hasAccounts: accounts.length > 0,
      hasActiveAccount: accounts.some(
        (account) => account.status === GoogleAdsStatus.ACTIVE,
      ),
    };
  }

  private async getGoogleAdsAccountBalance(
    accountId: string,
  ): Promise<Prisma.Decimal> {
    const [latestMovement, topUpAggregate, consumptionAggregate] =
      await Promise.all([
        this.prisma.googleAdsDailyMovement.findFirst({
          orderBy: {
            movementDate: 'desc',
          },
          select: {
            balance: true,
          },
          where: {
            googleAdsAccountId: accountId,
          },
        }),
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
      ]);

    if (latestMovement) {
      return latestMovement.balance;
    }

    return (topUpAggregate._sum.amount ?? new Prisma.Decimal(0)).minus(
      consumptionAggregate._sum.amount ?? new Prisma.Decimal(0),
    );
  }

  private async getRecentActivity(
    clientId: string,
  ): Promise<ClientDashboardActivityDto[]> {
    const [movements, payments, renewals, reports] = await Promise.all([
      this.prisma.googleAdsDailyMovement.findMany({
        include: {
          googleAdsAccount: {
            select: {
              accountName: true,
            },
          },
        },
        orderBy: {
          movementDate: 'desc',
        },
        take: 5,
        where: {
          clientId,
        },
      }),
      this.prisma.payment.findMany({
        orderBy: {
          receivedAt: 'desc',
        },
        take: 5,
        where: {
          clientId,
          status: PaymentStatus.CONFIRMED,
        },
      }),
      this.prisma.renewal.findMany({
        include: {
          service: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
        where: {
          clientId,
          status: RenewalStatus.COMPLETED,
        },
      }),
      this.prisma.googleAdsReport.findMany({
        include: {
          googleAdsAccount: {
            select: {
              accountName: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 5,
        where: {
          clientId,
        },
      }),
    ]);

    const activities: ActivityCandidate[] = [];

    for (const movement of movements) {
      if (movement.topUp.greaterThan(0)) {
        activities.push(
          this.createActivity({
            amount: movement.topUp,
            description: movement.googleAdsAccount.accountName,
            id: `google-ads-top-up-${movement.id}`,
            occurredAt: movement.movementDate,
            title: 'Recarga Google Ads recibida',
            type: 'GOOGLE_ADS_TOP_UP',
          }),
        );
      }

      if (
        movement.consumption.greaterThan(0) ||
        movement.clicks > 0 ||
        movement.conversions > 0
      ) {
        activities.push(
          this.createActivity({
            amount: movement.consumption,
            description: movement.googleAdsAccount.accountName,
            id: `google-ads-movement-${movement.id}`,
            occurredAt: movement.movementDate,
            title: 'Movimiento Google Ads registrado',
            type: 'GOOGLE_ADS_MOVEMENT',
          }),
        );
      }
    }

    for (const report of reports) {
      activities.push(
        this.createActivity({
          description: report.googleAdsAccount.accountName,
          id: `google-ads-report-${report.id}`,
          occurredAt: report.updatedAt,
          title: 'Campaña actualizada',
          type: 'CAMPAIGN_UPDATED',
        }),
      );
    }

    for (const payment of payments) {
      activities.push(
        this.createActivity({
          amount: payment.amount,
          description: 'Pago confirmado',
          id: `payment-${payment.id}`,
          occurredAt: payment.receivedAt,
          title: 'Pago aplicado',
          type: 'PAYMENT_APPLIED',
        }),
      );
    }

    for (const renewal of renewals) {
      activities.push(
        this.createActivity({
          amount: renewal.amount,
          description: renewal.service.name,
          id: `renewal-${renewal.id}`,
          occurredAt: renewal.renewedAt ?? renewal.updatedAt,
          title: 'Renovación realizada',
          type: 'RENEWAL_COMPLETED',
        }),
      );
    }

    if (activities.length === 0) {
      return this.getTemporaryActivity();
    }

    return activities
      .sort((first, second) => second.sortDate.getTime() - first.sortDate.getTime())
      .slice(0, 5)
      .map(({ sortDate: _sortDate, ...activity }) => activity);
  }

  private createActivity({
    amount,
    description,
    id,
    occurredAt,
    title,
    type,
  }: {
    amount?: Prisma.Decimal | null;
    description: string | null;
    id: string;
    occurredAt: Date;
    title: string;
    type: ClientDashboardActivityType;
  }): ActivityCandidate {
    return {
      amount: amount?.toString() ?? null,
      description,
      id,
      isTemporary: false,
      occurredAt,
      sortDate: occurredAt,
      title,
      type,
    };
  }

  private getTemporaryActivity(): ClientDashboardActivityDto[] {
    return [
      'Recarga Google Ads recibida',
      'Movimiento Google Ads registrado',
      'Campaña actualizada',
      'Pago aplicado',
      'Renovación realizada',
    ].map((title, index) => ({
      amount: null,
      description:
        'Placeholder temporal hasta conectar el historial visible del cliente.',
      id: `temp-activity-${index + 1}`,
      isTemporary: true,
      occurredAt: null,
      title: `TEMP - ${title}`,
      type: 'TEMP',
    }));
  }

  private buildContractedServices(
    googleAds: GoogleAdsDashboardData,
  ): ClientDashboardServiceDto[] {
    return [
      {
        description: 'Billetera publicitaria',
        href: '/client/google-ads',
        id: 'google-ads',
        isAvailable: true,
        isTemporary: false,
        metricLabel: 'Saldo',
        metricValue: googleAds.balance.toString(),
        name: 'Google Ads',
        status: googleAds.hasAccounts
          ? googleAds.hasActiveAccount
            ? 'Activo'
            : 'Pausado'
          : 'Sin cuentas',
      },
      {
        description: null,
        href: null,
        id: 'website',
        isAvailable: false,
        isTemporary: true,
        metricLabel: null,
        metricValue: null,
        name: 'Sitio Web',
        status: 'Próximamente',
      },
      {
        description: null,
        href: null,
        id: 'hosting',
        isAvailable: false,
        isTemporary: true,
        metricLabel: null,
        metricValue: null,
        name: 'Hosting',
        status: 'Próximamente',
      },
      {
        description: null,
        href: null,
        id: 'seo',
        isAvailable: false,
        isTemporary: true,
        metricLabel: null,
        metricValue: null,
        name: 'SEO',
        status: 'Próximamente',
      },
    ];
  }

  private toDashboardAccountStatus(
    status: ClientCommercialStatus,
  ): ClientDashboardAccountStatus {
    return status === ClientCommercialStatus.CURRENT
      ? 'CURRENT'
      : 'PAYMENT_PENDING';
  }

  private assertUuid(value: string, label: string): void {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      );

    if (!isUuid) {
      throw new BadRequestException(`${label} must be a valid UUID.`);
    }
  }
}
