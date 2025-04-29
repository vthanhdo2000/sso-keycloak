import { BadRequestException, Module, ValidationError, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { AppController } from './app.controller';
import { ApplicationModule } from './components/application/application.module';
import { ChatModule } from './components/chat/chat.module';
import { ConversationModule } from './components/conversation/conversation.module';
import { FeedbackModule } from './components/feedback/feedback.module';
import { FileModule } from './components/file/file.module';
import { SpeechModule } from './components/speech/speech.module';
import { AuthModule } from './components/auth/auth.module';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: parseInt(process.env.DB_PORT, 10),
    //   username: process.env.DB_USER,
    //   password: process.env.DB_PASS,
    //   database: process.env.DB_NAME,
    //   entities: [],
    //   synchronize: true,
    // }),
    ChatModule,
    FileModule,
    ApplicationModule,
    ConversationModule,
    FeedbackModule,
    SpeechModule,
    AuthModule,
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
