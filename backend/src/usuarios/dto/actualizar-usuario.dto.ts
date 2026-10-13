
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { EstadoUsuario } from '../../entities/usuario.entity.js';

export class ActualizarUsuarioDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(30)
    documento?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    apellidos?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    nombres?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    @MaxLength(150)
    email?: string;

    @ApiPropertyOptional({ enum: EstadoUsuario })
    @IsOptional()
    @IsEnum(EstadoUsuario)
    estado?: EstadoUsuario;
}
