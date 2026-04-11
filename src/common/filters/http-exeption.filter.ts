import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AppResponse } from '../types';

interface NestErrorResponse {
  error: string;
  message: string | string[];
  statusCode: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpError');
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as NestErrorResponse).message
        : exceptionResponse;
    this.logger.error(
      `\n Status: ${status} \n Error: ${JSON.stringify(message)} \n Path: ${request.url}`,
    );
    this.logger.error(`\n Exeption text ${JSON.stringify(exception)}`);

    const resp: AppResponse = {
      success: false,
      data: null,
      error: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
        details: 'HTTP Error',
      },
    };

    response.status(status).json(resp);
  }
}
