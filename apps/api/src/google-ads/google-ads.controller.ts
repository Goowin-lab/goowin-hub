import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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

import { CurrentUser, Roles } from '../common/decorators';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { JwtPayload } from '../common/types/authenticated-request.type';
import { CreateGoogleAdsAccountDto } from './dto/create-google-ads-account.dto';
import { CreateGoogleAdsConsumptionDto } from './dto/create-google-ads-consumption.dto';
import { CreateGoogleAdsDailyMovementDto } from './dto/create-google-ads-daily-movement.dto';
import { CreateGoogleAdsTopUpDto } from './dto/create-google-ads-top-up.dto';
import { GoogleAdsAccountResponseDto } from './dto/google-ads-account-response.dto';
import { GoogleAdsConsumptionResponseDto } from './dto/google-ads-consumption-response.dto';
import { GoogleAdsDailyMovementAdminResponseDto } from './dto/google-ads-daily-movement-admin-response.dto';
import { GoogleAdsTopUpResponseDto } from './dto/google-ads-top-up-response.dto';
import { GoogleAdsService } from './google-ads.service';
import { UpdateGoogleAdsAccountDto } from './dto/update-google-ads-account.dto';

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
}
