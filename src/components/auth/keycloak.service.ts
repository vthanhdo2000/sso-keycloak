import { Injectable } from '@nestjs/common';
import axios from 'axios';
import jwt from 'jsonwebtoken';

@Injectable()
export class KeycloakService {
  private keycloakUrl = process.env.KEYCLOAK_URL;
  private clientId = process.env.KEYCLOAK_CLIENT_ID;
  private clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  async login({ username, password }: { username: string; password: string }) {
    const url = `${this.keycloakUrl}/token`;

    console.log(url);

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('username', username);
    params.append('password', password);

    const { data } = await axios.post(url, params);
    return data;
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
      throw new Error('Invalid token');
    }
  }
}
