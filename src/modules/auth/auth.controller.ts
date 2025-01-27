import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { ApiResponseUtil, ApiResponse } from 'src/utils/api.response.util';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<ApiResponse<any>> {
    try {
      const data = await this.authService.register(
        registerUserDto.email,
        registerUserDto.name,
        registerUserDto.password,
      );
      return ApiResponseUtil.success('User registered successfully', data);
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<ApiResponse<any>> {
    try {
      const data = await this.authService.login(
        loginUserDto.username,
        loginUserDto.password,
      );
      return ApiResponseUtil.success('User logged in successfully', data);
    } catch (error) {
      throw error;
    }
  }

  //TODO: Implement logout after implementing the guards
  @Post('logout')
  async logout() {}
}
