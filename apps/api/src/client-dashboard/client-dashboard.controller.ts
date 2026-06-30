import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { JwtPayload } from '../common/types/authenticated-request.type';
import { ClientDashboardService } from './client-dashboard.service';
import {
  ClientDashboardActivityDto,
  ClientDashboardResponseDto,
  ClientDashboardServiceDto,
  ClientDashboardSummaryDto,
} from './dto/client-dashboard-response.dto';

type DevelopmentClientReference = {
  id: string;
  name: string;
};

type DevelopmentClientDashboardResponse = {
  client: DevelopmentClientReference | null;
  recentActivity: ClientDashboardActivityDto[];
  services: ClientDashboardServiceDto[];
  summary: ClientDashboardSummaryDto | null;
};

@ApiTags('Client Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.GOOWIN_ADMIN,
  UserRole.GOOWIN_EDITOR,
  UserRole.CLIENT,
  UserRole.AGENCY,
)
@Controller('client/dashboard')
export class ClientDashboardController {
  constructor(
    private readonly clientDashboardService: ClientDashboardService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the client dashboard summary.' })
  @ApiResponse({ status: 200, type: ClientDashboardResponseDto })
  async getDashboard(
    @CurrentUser() currentUser: JwtPayload,
    @Query('clientId') clientId?: string,
  ): Promise<ClientDashboardResponseDto> {
    const targetClientId = await this.resolveTargetClientId(
      currentUser,
      clientId,
    );

    return this.clientDashboardService.getDashboard(targetClientId);
  }

  private async resolveTargetClientId(
    currentUser: JwtPayload,
    clientId?: string,
  ): Promise<string> {
    if (
      currentUser.role === UserRole.CLIENT ||
      currentUser.role === UserRole.AGENCY
    ) {
      if (!currentUser.clientId) {
        throw new ForbiddenException(
          'The authenticated user is not linked to a client.',
        );
      }

      if (clientId && clientId !== currentUser.clientId) {
        throw new ForbiddenException(
          'The authenticated user does not have access to this client.',
        );
      }

      return currentUser.clientId;
    }

    if (clientId) {
      return clientId;
    }

    if (process.env.NODE_ENV !== 'production') {
      // TODO(client-auth): remove this temporary/dev fallback when real client login provides clientId.
      const client = await this.clientDashboardService.findDevelopmentClient();

      if (client) {
        return client.id;
      }

      throw new NotFoundException('Client was not found.');
    }

    throw new BadRequestException('clientId is required.');
  }
}

@ApiTags('Client Dashboard Dev')
@Controller('dev/client/dashboard')
export class ClientDashboardDevelopmentController {
  constructor(
    private readonly clientDashboardService: ClientDashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'DEV only: load the temporary client dashboard.',
  })
  async getDevelopmentDashboard(
    @Query('clientId') clientId?: string,
  ): Promise<DevelopmentClientDashboardResponse> {
    this.assertDevelopmentMode();

    // TODO(client-auth): remove this temporary/dev fallback when real client login provides clientId.
    const client = await this.clientDashboardService.findDevelopmentClient(
      clientId,
    );

    if (!client) {
      return {
        client: null,
        recentActivity: [],
        services: [],
        summary: null,
      };
    }

    return {
      client,
      ...(await this.clientDashboardService.getDashboard(client.id)),
    };
  }

  private assertDevelopmentMode(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException('Development endpoint was not found.');
    }
  }
}
