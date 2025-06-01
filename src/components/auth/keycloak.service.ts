import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { BaseExceptionFilter } from 'src/common/exceptions/base-exception.filter';
import { mapStatus } from 'src/common/utils/map-statuscode';

@Injectable()
export class KeycloakService {
  private keycloakUrl = process.env.KEYCLOAK_URL;
  private clientId = process.env.KEYCLOAK_CLIENT_ID;
  private clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  async login({ username, password }: { username: string; password: string }) {
    try {
      const url = `${this.keycloakUrl}/token`;
      // if (url) {
      //   throw new NotFoundException({
      //     message: 'IDG-0020004',
      //     error: ['data user not found'],
      //     statusCode: 404,
      //   });
      // }
      if (url) {
        throw new BaseExceptionFilter('AI-UNKNOWN-ERROR', ['Lỗi không xác định'], 409, {
          imgs: { img_front: 'url1' },
          tampering: { is_legal: 'no' },
        });
      }
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('username', username);
      params.append('password', password);

      const { data } = await axios.post(url, params);
      return data;
    } catch (error) {
      console.log('Error: ', error);

      throw new ConflictException({
        message: 'IDG-0020004',
        error: ['Internal server'],
        statusCode: 409,
      });
    }
  }

  async refreshToken(refreshToken: string) {
    const url = `${this.keycloakUrl}/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('refresh_token', refreshToken);

    const { data } = await axios.post(url, params);
    return data;
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.KEYCLOAK_CLIENT_SECRET, {
        algorithms: ['RS256'],
      });
      return decoded;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Invalid token');
    }
  }
}
