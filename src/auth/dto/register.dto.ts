import {
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

    constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}