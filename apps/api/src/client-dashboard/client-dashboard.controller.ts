import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { CurrentUser, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { JwtPayload } from '../common/types/authenticated-request.type';
import { ClientDashboardService } from './client-dashboard.service';
import { ClientDashboardResponseDto } from './dto/client-dashboard-response.dto';

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
    const targetClientId = this.resolveTargetClientId(currentUser, clientId);

    return this.clientDashboardService.getDashboard(targetClientId);
  }

  private resolveTargetClientId(
    currentUser: JwtPayload,
    clientId?: string,
  ): string {
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

    throw new BadRequestException('clientId is required.');
  }
}
