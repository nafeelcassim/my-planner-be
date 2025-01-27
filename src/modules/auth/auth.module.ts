import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KeycloakService } from 'src/services/keycloak.service';
import { PrismaService } from 'src/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [AuthService, KeycloakService, PrismaService, ConfigService],
})
export class AuthModule {}
