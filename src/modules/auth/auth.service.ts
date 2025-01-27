import { Injectable, Logger } from '@nestjs/common';
import { KeycloakService } from 'src/services/keycloak.service';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(email: string, name: string, password: string) {
    const userCreated = await this.keycloakService.createUser(
      email,
      name,
      password,
    );
    if (userCreated) {
      const user = await this.prismaService.user.create({
        data: {
          email,
          name,
        },
      });
      return user;
    }
  }

  async login(username: string, password: string) {
    return await this.keycloakService.login(username, password);
  }

  async logout(token: string) {
    return await this.keycloakService.logout(token);
  }

  async refreshToken(token: string) {
    return await this.keycloakService.refreshToken(token);
  }
}
