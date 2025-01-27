import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The password of the user',
  })
  @IsString()
  password: string;
}

export class LoginUserDto {
  @ApiProperty({
    description: 'The username of the user',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
