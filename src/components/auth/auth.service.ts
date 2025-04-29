import { Injectable } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { KeycloakService } from './keycloak.service';

@Injectable()
export class AuthService {
  constructor(private readonly keycloakService: KeycloakService) {}

  async login(loginDto: LoginDto) {
    return this.keycloakService.login(loginDto);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    return this.keycloakService.refreshToken(refreshTokenDto.refreshToken);
  }

  async verifyToken(token: string) {
    return this.keycloakService.verifyToken(token);
  }
}
