import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Client } from '@prisma/client';

import { CurrentUser, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { JwtPayload } from '../common/types/authenticated-request.type';
import { CreateGoogleAdsAccountDto } from './dto/create-google-ads-account.dto';
import { CreateGoogleAdsConsumptionDto } from './dto/create-google-ads-consumption.dto';
import { CreateGoogleAdsDailyMovementDto } from './dto/create-google-ads-daily-movement.dto';
import { CreateGoogleAdsTopUpDto } from './dto/create-google-ads-top-up.dto';
import { GoogleAdsAccountResponseDto } from './dto/google-ads-account-response.dto';
import { GoogleAdsClientAccountDetailResponseDto } from './dto/google-ads-client-account-detail-response.dto';
import { GoogleAdsClientAccountResponseDto } from './dto/google-ads-client-account-response.dto';
import { GoogleAdsClientSummaryResponseDto } from './dto/google-ads-client-summary-response.dto';
import { GoogleAdsConsumptionResponseDto } from './dto/google-ads-consumption-response.dto';
import { GoogleAdsDailyMovementAdminResponseDto } from './dto/google-ads-daily-movement-admin-response.dto';
import { GoogleAdsTopUpResponseDto } from './dto/google-ads-top-up-response.dto';
import { GoogleAdsService } from './google-ads.service';
import { UpdateGoogleAdsAccountDto } from './dto/update-google-ads-account.dto';

type DevelopmentClientGoogleAdsResponse = {
  accounts: GoogleAdsClientAccountResponseDto[];
  client: DevelopmentClientReference | null;
  summary: GoogleAdsClientSummaryResponseDto | null;
};

type DevelopmentClientGoogleAdsDetailResponse = {
  client: DevelopmentClientReference | null;
  detail: GoogleAdsClientAccountDetailResponseDto | null;
};

type DevelopmentClientReference = Pick<Client, 'id' | 'name'>;

@ApiTags('Google Ads Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GOOWIN_ADMIN, UserRole.GOOWIN_EDITOR)
@Controller()
export class GoogleAdsController {
  constructor(private readonly googleAdsService: GoogleAdsService) {}

  @Post('google-ads/accounts')
  @ApiOperation({ summary: 'Create a Google Ads wallet account.' })
  @ApiResponse({ status: 201, type: GoogleAdsAccountResponseDto })
  createAccount(
    @Body() createAccountDto: CreateGoogleAdsAccountDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<GoogleAdsAccountResponseDto> {
    return this.googleAdsService.createAccount(
      createAccountDto,
      currentUser.sub,
    );
  }

  @Get('google-ads/accounts')
  @ApiOperation({ summary: 'List Google Ads wallet accounts.' })
  @ApiResponse({
    status: 200,
    type: GoogleAdsAccountResponseDto,
    isArray: true,
  })
  findAccounts(): Promise<GoogleAdsAccountResponseDto[]> {
    return this.googleAdsService.findAccounts();
  }

  @Get('google-ads/accounts/:id')
  @ApiOperation({ summary: 'Get a Google Ads wallet account.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: GoogleAdsAccountResponseDto })
  findAccount(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<GoogleAdsAccountResponseDto> {
    return this.googleAdsService.findAccount(id);
  }

  @Patch('google-ads/accounts/:id')
  @ApiOperation({ summary: 'Update Google Ads account commercial settings.' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: GoogleAdsAccountResponseDto })
  updateAccount(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateAccountDto: UpdateGoogleAdsAccountDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<GoogleAdsAccountResponseDto> {
    return this.googleAdsService.updateAccount(
      id,
      updateAccountDto,
      currentUser.sub,
    );
  }

  @Get('clients/:clientId/google-ads/accounts')
  @ApiOperation({ summary: 'List Google Ads wallet accounts for a client.' })
  @ApiParam({ name: 'clientId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    type: GoogleAdsAccountResponseDto,
    isArray: true,
  })
  findAccountsByClient(
    @Param('clientId', new ParseUUIDPipe({ version: '4' })) clientId: string,
  ): Promise<GoogleAdsAccountResponseDto[]> {
    return this.googleAdsService.findAccountsByClient(clientId);
  }

  @Get('clients/:clientId/google-ads/client/summary')
  @Roles(
    UserRole.GOOWIN_ADMIN,
    UserRole.GOOWIN_EDITOR,
    UserRole.CLIENT,
    UserRole.AGENCY,
  )
  @ApiOperation({ summary: 'Get client-visible Google Ads summary.' })
  @ApiParam({ name: 'clientId', format: 'uuid' })
  @ApiResponse({ status: 200, type: GoogleAdsClientSummaryResponseDto })
  getClientSummary(
    @Param('clientId', new ParseUUIDPipe({ version: '4' })) clientId: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<GoogleAdsClientSummaryResponseDto> {
    this.assertCanReadClient(clientId, currentUser);
    return this.googleAdsService.getClientSummary(clientId);
  }

  @Get('clients/:clientId/google-ads/client/accounts')
  @Roles(
    UserRole.GOOWIN_ADMIN,
    UserRole.GOOWIN_EDITOR,
    UserRole.CLIENT,
    UserRole.AGENCY,
  )
  @ApiOperation({ summary: 'List client-visible Google Ads accounts.' })
  @ApiParam({ name: 'clientId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    type: GoogleAdsClientAccountResponseDto,
    isArray: true,
  })
  findClientAccounts(
    @Param('clientId', new ParseUUIDPipe({ version: '4' })) clientId: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<GoogleAdsClientAccountResponseDto[]> {
    this.assertCanReadClient(clientId, currentUser);
    return this.googleAdsService.findClientAccounts(clientId);
  }

  @Get('clients/:clientId/google-ads/client/accounts/:accountId')
  @Roles(
    UserRole.GOOWIN_ADMIN,
    UserRole.GOOWIN_EDITOR,
    UserRole.CLIENT,
    UserRole.AGENCY,
  )
  @ApiOperation({ summary: 'Get client-visible Google Ads account detail.' })
  @ApiParam({ name: 'clientId', format: 'uuid' })
  @ApiParam({ name: 'accountId', format: 'uuid' })
  @ApiResponse({ status: 200, type: GoogleAdsClientAccountDetailResponseDto })
  findClientAccountDetail(
    @Param('clientId', new ParseUUIDPipe({ version: '4' })) clientId: string,
    @Param('accountId', new ParseUUIDPipe({ version: '4' }))
    accountId: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<GoogleAdsClientAccountDetailResponseDto> {
    this.assertCanReadClient(clientId, currentUser);
    return this.googleAdsService.findClientAccountDetail(clientId, accountId);
  }

  @Post('google-ads/accounts/:accountId/top-ups')
  @ApiOperation({ summary: 'Register a Google Ads top-up.' })
  @ApiParam({ name: 'accountId', format: 'uuid' })
  @ApiResponse({ status: 201, type: GoogleAdsTopUpResponseDto })
  registerTopUp(
    @Param('accountId', new ParseUUIDPipe({ version: '4' })) accountId: string,
    @Body() createTopUpDto: CreateGoogleAdsTopUpDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<GoogleAdsTopUpResponseDto> {
    return this.googleAdsService.registerTopUp(
      accountId,
      createTopUpDto,
      currentUser.sub,
    );
  }

  @Get('google-ads/accounts/:accountId/top-ups')
  @ApiOperation({ summary: 'List Google Ads top-ups.' })
  @ApiParam({ name: 'accountId', format: 'uuid' })
  @ApiResponse({ status: 200, type: GoogleAdsTopUpResponseDto, isArray: true })
  findTopUps(
    @Param('accountId', new ParseUUIDPipe({ version: '4' })) accountId: string,
  ): Promise<GoogleAdsTopUpResponseDto[]> {
    return this.googleAdsService.findTopUps(accountId);
  }

  @Post('google-ads/accounts/:accountId/consumptions')
  @ApiOperation({ summary: 'Register a Google Ads consumption.' })
  @ApiParam({ name: 'accountId', format: 'uuid' })
  @ApiResponse({ status: 201, type: GoogleAdsConsumptionResponseDto })
  registerConsumption(
    @Param('accountId', new ParseUUIDPipe({ version: '4' })) accountId: string,
    @Body() createConsumptionDto: CreateGoogleAdsConsumptionDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<GoogleAdsConsumptionResponseDto> {
    return this.googleAdsService.registerConsumption(
      accountId,
      createConsumptionDto,
      currentUser.sub,
    );
  }

  @Get('google-ads/accounts/:accountId/consumptions')
  @ApiOperation({ summary: 'List Google Ads consumptions.' })
  @ApiParam({ name: 'accountId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    type: GoogleAdsConsumptionResponseDto,
    isArray: true,
  })
  findConsumptions(
    @Param('accountId', new ParseUUIDPipe({ version: '4' })) accountId: string,
  ): Promise<GoogleAdsConsumptionResponseDto[]> {
    return this.googleAdsService.findConsumptions(accountId);
  }

  @Post('google-ads/accounts/:accountId/daily-movements')
  @ApiOperation({ summary: 'Register a Google Ads daily movement.' })
  @ApiParam({ name: 'accountId', format: 'uuid' })
  @ApiResponse({ status: 201, type: GoogleAdsDailyMovementAdminResponseDto })
  registerDailyMovement(
    @Param('accountId', new ParseUUIDPipe({ version: '4' })) accountId: string,
    @Body() createMovementDto: CreateGoogleAdsDailyMovementDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<GoogleAdsDailyMovementAdminResponseDto> {
    return this.googleAdsService.registerDailyMovement(
      accountId,
      createMovementDto,
      currentUser.sub,
    );
  }

  @Get('google-ads/accounts/:accountId/daily-movements')
  @ApiOperation({
    summary: 'List Google Ads daily movements with admin-only cost fields.',
  })
  @ApiParam({ name: 'accountId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    type: GoogleAdsDailyMovementAdminResponseDto,
    isArray: true,
  })
  findDailyMovements(
    @Param('accountId', new ParseUUIDPipe({ version: '4' })) accountId: string,
  ): Promise<GoogleAdsDailyMovementAdminResponseDto[]> {
    return this.googleAdsService.findDailyMovements(accountId);
  }

  private assertCanReadClient(clientId: string, currentUser: JwtPayload): void {
    if (
      (currentUser.role === UserRole.CLIENT ||
        currentUser.role === UserRole.AGENCY) &&
      currentUser.clientId !== clientId
    ) {
      throw new ForbiddenException(
        'The authenticated user does not have access to this client.',
      );
    }
  }
}

@ApiTags('Google Ads Client Dev')
@Controller('dev/google-ads/client')
export class GoogleAdsClientDevelopmentController {
  constructor(private readonly googleAdsService: GoogleAdsService) {}

  @Get()
  @ApiOperation({
    summary:
      'DEV only: load the temporary client-visible Google Ads dashboard.',
  })
  async getDevelopmentClientGoogleAds(
    @Query('clientId') clientId?: string,
  ): Promise<DevelopmentClientGoogleAdsResponse> {
    this.assertDevelopmentMode();

    // TODO(client-auth): remove this temporary/dev fallback when real client login provides clientId.
    const client = await this.googleAdsService.findDevelopmentClient(clientId);

    if (!client) {
      return {
        accounts: [],
        client: null,
        summary: null,
      };
    }

    const [summary, accounts] = await Promise.all([
      this.googleAdsService.getClientSummary(client.id),
      this.googleAdsService.findClientAccounts(client.id),
    ]);

    return {
      accounts,
      client: toDevelopmentClientReference(client),
      summary,
    };
  }

  @Get('accounts/:accountId')
  @ApiOperation({
    summary:
      'DEV only: load temporary client-visible Google Ads account detail.',
  })
  async getDevelopmentClientGoogleAdsDetail(
    @Param('accountId', new ParseUUIDPipe({ version: '4' }))
    accountId: string,
    @Query('clientId') clientId?: string,
  ): Promise<DevelopmentClientGoogleAdsDetailResponse> {
    this.assertDevelopmentMode();

    // TODO(client-auth): remove this temporary/dev fallback when real client login provides clientId.
    const client = await this.googleAdsService.findDevelopmentClient(clientId);

    if (!client) {
      return {
        client: null,
        detail: null,
      };
    }

    return {
      client: toDevelopmentClientReference(client),
      detail: await this.googleAdsService.findClientAccountDetail(
        client.id,
        accountId,
      ),
    };
  }

  private assertDevelopmentMode(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException('Development endpoint was not found.');
    }
  }
}

function toDevelopmentClientReference(
  client: Client,
): DevelopmentClientReference {
  return {
    id: client.id,
    name: client.name,
  };
}
