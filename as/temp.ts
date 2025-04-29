// Cấu trúc dự án
/*
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── dto/
│   │   └── login.dto.ts
│   └── guards/
│       ├── auth.guard.ts
│       ├── roles.guard.ts
│       └── roles.decorator.ts
├── common/
│   └── keycloak.service.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── dto/
│       └── user.dto.ts
├── app.module.ts
└── main.ts
*/

// Cài đặt các package cần thiết
// npm install @nestjs/common @nestjs/core @nestjs/platform-express
// npm install @nestjs/swagger swagger-ui-express
// npm install keycloak-connect keycloak-admin
// npm install axios jsonwebtoken
// npm install --save-dev @types/jsonwebtoken

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('SSO API')
    .setDescription('API documentation for SSO service with Keycloak')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Global Pipe cho validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

// app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KeycloakService } from './common/keycloak.service';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [KeycloakService],
  exports: [KeycloakService],
})
export class AppModule {}

// common/keycloak.service.ts
import { Injectable } from '@nestjs/common';
import KcAdminClient from 'keycloak-admin';
import KeycloakConnect from 'keycloak-connect';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

@Injectable()
export class KeycloakService {
  private adminClient: KcAdminClient;
  private keycloakConnect: KeycloakConnect.Keycloak;
  private readonly keycloakConfig = {
    realm: 'master',
    'auth-server-url': 'http://localhost:8080/auth',
    'ssl-required': 'external',
    resource: 'nest-api',
    'public-client': true,
    'confidential-port': 0,
    'bearer-only': true,
  };

  constructor() {
    // Khởi tạo Keycloak Connect
    const memoryStore = new KeycloakConnect.MemoryStore();
    this.keycloakConnect = new KeycloakConnect(
      { store: memoryStore },
      this.keycloakConfig,
    );

    // Khởi tạo Admin Client
    this.adminClient = new KcAdminClient({
      baseUrl: 'http://localhost:8080/auth',
      realmName: 'master',
    });

    // Kết nối tới Keycloak Admin API
    this.initAdminClient();
  }

  private async initAdminClient() {
    try {
      await this.adminClient.auth({
        username: 'admin',
        password: 'admin',
        grantType: 'password',
        clientId: 'admin-cli',
      });

      // Tự động refresh token
      setInterval(async () => {
        try {
          await this.adminClient.auth({
            username: 'admin',
            password: 'admin',
            grantType: 'password',
            clientId: 'admin-cli',
          });
        } catch (error) {
          console.error('Failed to refresh Keycloak admin token', error);
        }
      }, 58 * 60 * 1000); // 58 phút
    } catch (error) {
      console.error('Failed to authenticate Keycloak admin client', error);
    }
  }

  getKeycloakInstance(): KeycloakConnect.Keycloak {
    return this.keycloakConnect;
  }

  getAdminClient(): KcAdminClient {
    return this.adminClient;
  }

  async getToken(username: string, password: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.keycloakConfig['auth-server-url']}/realms/${
          this.keycloakConfig.realm
        }/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: this.keycloakConfig.resource,
          grant_type: 'password',
          username,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to get token from Keycloak');
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      // Xử lý token không có tiền tố "Bearer"
      const actualToken = token.startsWith('Bearer ')
        ? token.slice(7)
        : token;

      const response = await axios.get(
        `${this.keycloakConfig['auth-server-url']}/realms/${
          this.keycloakConfig.realm
        }/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${actualToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error('Invalid token or token expired');
    }
  }

  decodeToken(token: string): any {
    // Xử lý token không có tiền tố "Bearer"
    const actualToken = token.startsWith('Bearer ')
      ? token.slice(7)
      : token;
      
    // Chú ý: Phương thức này chỉ decode token mà không verify
    return jwt.decode(actualToken);
  }

  hasRole(token: string, role: string): boolean {
    const decoded = this.decodeToken(token);
    
    if (!decoded || !decoded.realm_access || !decoded.realm_access.roles) {
      return false;
    }
    
    return decoded.realm_access.roles.includes(role);
  }
}

// auth/guards/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { KeycloakService } from '../../common/keycloak.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly keycloakService: KeycloakService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    try {
      // Xử lý token không có tiền tố "Bearer"
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
        
      // Xác thực token
      const userInfo = await this.keycloakService.verifyToken(token);
      
      // Đính kèm thông tin người dùng vào request
      request.user = userInfo;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or token expired');
    }
  }
}

// auth/guards/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KeycloakService } from '../../common/keycloak.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private keycloakService: KeycloakService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Không yêu cầu role cụ thể
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    // Xử lý token không có tiền tố "Bearer"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // Kiểm tra xem người dùng có ít nhất một trong các quyền yêu cầu không
    return requiredRoles.some(role => 
      this.keycloakService.hasRole(token, role)
    );
  }
}

// auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'password', description: 'Password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { KeycloakService } from '../common/keycloak.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly keycloakService: KeycloakService) {}

  async login(loginDto: LoginDto) {
    try {
      const tokenResponse = await this.keycloakService.getToken(
        loginDto.username,
        loginDto.password,
      );
      
      // Giải mã token để trích xuất thông tin
      const decodedToken = this.keycloakService.decodeToken(
        tokenResponse.access_token,
      );
      
      return {
        ...tokenResponse,
        user: {
          id: decodedToken.sub,
          username: decodedToken.preferred_username,
          email: decodedToken.email,
          roles: decodedToken.realm_access?.roles || [],
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async getUserInfo(token: string) {
    try {
      return await this.keycloakService.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token or token expired');
    }
  }
}

// auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { Roles } from './guards/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get token' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Admin only endpoint' })
  async adminEndpoint() {
    return { message: 'Admin access granted' };
  }

  @Get('client')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('client')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Client only endpoint' })
  async clientEndpoint() {
    return { message: 'Client access granted' };
  }

  @Get('both')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'client')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Endpoint for both admin and client' })
  async bothEndpoint() {
    return { message: 'Access granted for admin or client' };
  }
}

// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KeycloakService } from '../common/keycloak.service';

@Module({
  providers: [AuthService, KeycloakService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

// users/dto/user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user1', description: 'Username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'user1@example.com', description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password', description: 'Password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: ['client'], description: 'User roles' })
  roles: string[];
}

// users/users.service.ts
import { Injectable } from '@nestjs/common';
import { KeycloakService } from '../common/keycloak.service';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly keycloakService: KeycloakService) {}

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    try {
      // Lấy client từ AdminClient
      const adminClient = this.keycloakService.getAdminClient();
      
      // Tạo user
      const user = await adminClient.users.create({
        username: createUserDto.username,
        email: createUserDto.email,
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: createUserDto.password,
            temporary: false,
          },
        ],
      });

      // Lấy ID của role mong muốn
      const roles = await adminClient.roles.find();
      
      // Thêm roles cho user
      for (const roleName of createUserDto.roles) {
        const role = roles.find((r) => r.name === roleName);
        
        if (role) {
          await adminClient.users.addRealmRoleMappings({
            id: user.id,
            roles: [
              {
                id: role.id,
                name: role.name,
              },
            ],
          });
        }
      }

      return { id: user.id, message: 'User created successfully' };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const adminClient = this.keycloakService.getAdminClient();
      return await adminClient.users.find();
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }
}

// users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}

// users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { KeycloakService } from '../common/keycloak.service';

@Module({
  providers: [UsersService, KeycloakService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}