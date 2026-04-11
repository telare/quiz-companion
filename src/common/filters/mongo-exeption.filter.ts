import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongooseError, Error, mongo } from 'mongoose';

import { AppResponse } from '../types';

@Catch(MongooseError, mongo.MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('MongoError');
  catch(
    exception: mongo.MongoServerError | MongooseError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorType = 'DatabaseError';

    if (exception instanceof MongooseError) {
      if (exception instanceof Error.ValidationError) {
        status = HttpStatus.BAD_REQUEST;
        message = Object.values(exception.errors)
          .map((el) => el.message)
          .join(', ');
        errorType = 'ValidationError';
      } else if (exception instanceof Error.CastError) {
        status = HttpStatus.BAD_REQUEST;
        message = `Invalid ${exception.path}: ${exception.value}`;
        errorType = 'CastError';
      }
    }
    if (exception instanceof mongo.MongoServerError) {
      const code = exception.code;
      switch (code) {
        case 2:
          status = HttpStatus.BAD_REQUEST;
          message =
            'Invalid value or parameter passed to the database command.';
          errorType = 'BadValueError';
          break;

        case 13:
          status = HttpStatus.FORBIDDEN;
          message = 'Database access denied: Unauthorized operation.';
          errorType = 'UnauthorizedError';
          break;

        case 18:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message =
            'Database authentication failed. Please check server configuration.';
          errorType = 'AuthenticationFailed';
          break;

        case 50:
          status = HttpStatus.GATEWAY_TIMEOUT;
          message = 'The database operation timed out (MaxTimeMS exceeded).';
          errorType = 'ExceededTimeLimit';
          break;

        case 121:
          status = HttpStatus.BAD_REQUEST;
          message = 'Document validation failed at the database level.';
          errorType = 'DocumentValidationFailure';
          break;

        case 11000:
          status = HttpStatus.CONFLICT;
          // const field = exception.keyPattern
          //   ? Object.keys(exception.keyPattern)[0]
          //   : "Field";
          message = `Field already exists.`;
          errorType = 'DuplicateKeyError';
          break;

        case 11600:
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message =
            'The database server is shutting down and interrupted the request.';
          errorType = 'InterruptedAtShutdown';
          break;

        default:
          message = exception.errmsg || 'A database server error occurred.';
          errorType = 'MongoServerError';
          break;
      }
    }

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
        details: `Mongoose or MongoDB error. Error type: ${errorType}`,
      },
    };
    response.status(status).json(resp);
  }
}
