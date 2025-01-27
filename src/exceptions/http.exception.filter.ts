import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseUtil } from 'src/utils/api.response.util';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse['message']
        ? exceptionResponse['message']
        : exception.message;

    response
      .status(status)
      .json(ApiResponseUtil.error('An error occurred', message, status));
  }
}
