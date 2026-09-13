import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from '../usuarios/dto/login.dto.js';
import { ApiOkResponse } from '@nestjs/swagger';
import { LoginRespuestaDto } from './dto/login-respuesta.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: LoginRespuestaDto })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
