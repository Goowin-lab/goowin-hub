import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard, RolesGuard } from './guards';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwtExpiresIn', '1h'),
        },
      }),
    }),
  ],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
  providers: [JwtAuthGuard, RolesGuard],
})
export class CommonModule {}
