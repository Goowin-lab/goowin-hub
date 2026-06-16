import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CreateGoogleAdsTopUpDto } from './dto/create-google-ads-top-up.dto';
import { GoogleAdsAccountResponseDto } from './dto/google-ads-account-response.dto';
import { GoogleAdsConsumptionResponseDto } from './dto/google-ads-consumption-response.dto';
import { GoogleAdsTopUpResponseDto } from './dto/google-ads-top-up-response.dto';
import { GoogleAdsService } from './google-ads.service';

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
}
