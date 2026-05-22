import {
  IsEmail,
  isEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export enum Roles {
  admin = 'admin',
  company = 'company',
  candidate = 'candidate',
}


export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  @IsEnum(Roles)
  role: Roles;
}
