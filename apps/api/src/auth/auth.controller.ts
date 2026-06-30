import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards';
import { JwtPayload } from '../common/types/authenticated-request.type';
import { AuthService } from './auth.service';
import {
  AuthSessionResponseDto,
  AuthUserDto,
  LoginResponseDto,
  LogoutResponseDto,
} from './dto/auth-session-response.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate a Goowin Hub user.' })
  @ApiResponse({ status: 201, type: LoginResponseDto })
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'End the current stateless session.' })
  @ApiResponse({ status: 201, type: LogoutResponseDto })
  logout(): LogoutResponseDto {
    return this.authService.logout();
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the authenticated user.' })
  @ApiResponse({ status: 200, type: AuthUserDto })
  me(@CurrentUser() currentUser: JwtPayload): Promise<AuthUserDto> {
    return this.authService.me(currentUser);
  }

  @Get('session')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the authenticated session.' })
  @ApiResponse({ status: 200, type: AuthSessionResponseDto })
  session(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<AuthSessionResponseDto> {
    return this.authService.session(currentUser);
  }
}
