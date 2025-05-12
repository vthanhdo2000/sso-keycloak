import { BadRequestException, Module, ValidationError, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { ApplicationModule } from './components/application/application.module';
import { AuthModule } from './components/auth/auth.module';
import { BackofficeModule } from './components/backoffice/backoffice.module';
import { ChatModule } from './components/chat/chat.module';
import { ConversationModule } from './components/conversation/conversation.module';
import { FeedbackModule } from './components/feedback/feedback.module';
import { FileEntity } from './components/file/entities/file.entity';
import { FileModule } from './components/file/file.module';
import { SpeechEntity } from './components/speech/entities/speech.entity';
import { SpeechModule } from './components/speech/speech.module';

@Module({
  imports: [
    //jdbc:postgresql://localhost:5432/my_database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'secret',
      database: 'my_database',
      entities: [FileEntity, SpeechEntity],
      synchronize: true,
    }),
    ChatModule,
    FileModule,
    ApplicationModule,
    ConversationModule,
    FeedbackModule,
    SpeechModule,
    AuthModule,
    BackofficeModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        validationError: { target: false, value: false },
        exceptionFactory: (validationErrors: ValidationError[] = []) => {
          const errors = [];
          for (const error of validationErrors) {
            let errorMessages = Object.values(error.constraints);
            errorMessages = errorMessages.map((e) => e.charAt(0).toUpperCase() + e.slice(1));
            for (const message of errorMessages) {
              errors.push(message);
            }
          }
          return new BadRequestException(errors);
        },
      }),
    },
  ],
})
export class AppModule {}
