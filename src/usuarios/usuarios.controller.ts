import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get()
  obtenerUsuarios() {
    return this.usuariosService.obtenerTodos();
  }

  @Get(':id')
  obtenerUsuario(@Param('id') id: string) {
    return this.usuariosService.obtenerPorId(Number(id));
  }

  @Post()
  crearUsuario(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crear(crearUsuarioDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usuariosService.login(loginDto);
  }
}