import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import authConfig from './configurations/auth.config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      load: [authConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        customAttributeKeys: {
          responseTime: 'timeSpent', // Rename the responseTime attribute to timeSpent
        },
        transport: {
          targets: [
            {
              target: 'pino-loki',
              options: {
                batching: true,
                interval: 5,
                host: 'http://localhost:3100', // Replace with your Loki URL
                labels: { job: 'nestjs-logs' },
              },
            },
            {
              target: 'pino-pretty', // Optional: for pretty-printing logs to the console
              options: {
                colorize: true,
              },
            },
          ],
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// const Tesseract = require('tesseract.js');

// Tesseract.recognize(
//   'new.jpg', // Path to the image
//   'eng',              // Language (e.g., 'eng' for English)
//   {
//     logger: m => console.log(m), // Optional: Log progress
//   }
// ).then(({ data: { text } }) => {
//     console.log(typeof text)
//   console.log('Extracted Text:', text.split('\n'));
// });
