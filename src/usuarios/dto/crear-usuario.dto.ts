import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { EstadoUsuario, RolUsuario } from '../../entities/usuario.entity.js';

export class CrearUsuarioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documento: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  clave: string;

  @ApiProperty({
    enum: EstadoUsuario,
  })
  @IsEnum(EstadoUsuario)
  estado: EstadoUsuario;

  @ApiProperty({
    enum: RolUsuario,
  })
  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
