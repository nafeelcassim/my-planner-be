import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import {
  KEYCLOAK_APP_CLIENT_ID_KEY,
  KEYCLOAK_APP_CLIENT_SECRET_KEY,
  KEYCLOAK_BASE_URL_KEY,
  KEYCLOAK_GRANT_TYPE_KEY,
  KEYCLOAK_REALM_KEY,
} from 'src/constants/common';

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);

  private KEYCLOAK_BASE_URL: string;
  private KEYCLOAK_GRANT_TYPE: string;
  private KEYCLOAK_APP_CLIENT_SECRET: string;
  private KEYCLOAK_REALM: string;
  private KEYCLOAK_CLIENT_ID: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.KEYCLOAK_BASE_URL = this.configService.get<string>(
      KEYCLOAK_BASE_URL_KEY,
    );
    this.KEYCLOAK_GRANT_TYPE = this.configService.get<string>(
      KEYCLOAK_GRANT_TYPE_KEY,
    );
    this.KEYCLOAK_APP_CLIENT_SECRET = this.configService.get<string>(
      KEYCLOAK_APP_CLIENT_SECRET_KEY,
    );
    this.KEYCLOAK_REALM = this.configService.get<string>(KEYCLOAK_REALM_KEY);
    this.KEYCLOAK_CLIENT_ID = this.configService.get<string>(
      KEYCLOAK_APP_CLIENT_ID_KEY,
    );
    this.KEYCLOAK_GRANT_TYPE = this.configService.get<string>(
      KEYCLOAK_GRANT_TYPE_KEY,
    );
  }

  // GET Personal Access Token To Access Keycloak API
  async getPAT() {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('grant_type', 'client_credentials');
    urlSearchParams.append('client_id', this.KEYCLOAK_CLIENT_ID);
    urlSearchParams.append('client_secret', this.KEYCLOAK_APP_CLIENT_SECRET);
    const res = await firstValueFrom(
      this.httpService
        .post(
          `${this.KEYCLOAK_BASE_URL}/realms/${this.KEYCLOAK_REALM}/protocol/openid-connect/token`,
          urlSearchParams,
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new BadRequestException('Invalid credentials');
          }),
        ),
    );

    const { access_token } = res.data;
    return access_token;
  }

  // Register User to the application in KeyCloak
  async createUser(email: string, name: string, password: string) {
    const token = await this.getPAT();
    const userPayload = {
      username: email,
      email,
      enabled: true,
      emailVerified: true,
      attributes: {
        locale: '',
        name: name,
      },
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    };

    const response = await firstValueFrom(
      this.httpService
        .post(
          `${this.KEYCLOAK_BASE_URL}/admin/realms/${this.KEYCLOAK_REALM}/users`,
          userPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new InternalServerErrorException(
              'Failed to create user in Keycloak',
            );
          }),
        ),
    );

    return response.status === 201;
  }

  // This is the login method
  async login(username: string, password: string) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('grant_type', this.KEYCLOAK_GRANT_TYPE);
    urlSearchParams.append('client_id', this.KEYCLOAK_CLIENT_ID);
    urlSearchParams.append('client_secret', this.KEYCLOAK_APP_CLIENT_SECRET);
    urlSearchParams.append('username', username);
    urlSearchParams.append('password', password);

    const res = await firstValueFrom(
      this.httpService
        .post(
          `${this.KEYCLOAK_BASE_URL}/realms/${this.KEYCLOAK_REALM}/protocol/openid-connect/token`,
          urlSearchParams,
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new UnauthorizedException('Invalid credentials');
          }),
        ),
    );

    return res.data;
  }

  // This is logout
  async logout(refreshToken: string) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('client_id', this.KEYCLOAK_CLIENT_ID);
    urlSearchParams.append('client_secret', this.KEYCLOAK_APP_CLIENT_SECRET);
    urlSearchParams.append('refresh_token', refreshToken);

    await firstValueFrom(
      this.httpService
        .post(
          `${this.KEYCLOAK_BASE_URL}/realms/${this.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
          urlSearchParams,
        )
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw new InternalServerErrorException(
              'Failed to logout from Keycloak',
            );
          }),
        ),
    );

    return { message: 'Logout successful' };
  }

  // Refresh Token End point
  async refreshToken(refreshToken: string) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('grant_type', 'refresh_token'); // Use refresh_token grant type
    urlSearchParams.append('client_id', this.KEYCLOAK_CLIENT_ID);
    urlSearchParams.append('client_secret', this.KEYCLOAK_APP_CLIENT_SECRET);
    urlSearchParams.append('refresh_token', refreshToken);

    try {
      const res = await firstValueFrom(
        this.httpService
          .post(
            `${this.KEYCLOAK_BASE_URL}/realms/${this.KEYCLOAK_REALM}/protocol/openid-connect/token`,
            urlSearchParams,
          )
          .pipe(
            catchError((error) => {
              this.logger.error(error);
              throw new UnauthorizedException('Failed to refresh token');
            }),
          ),
      );

      return res.data; // Returns the new access token, refresh token, and other details
    } catch (error) {
      this.logger.error(`Error refreshing token: ${error.message}`);
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }
}
