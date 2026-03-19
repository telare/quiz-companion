import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

interface NestErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const hostType = host.getType();

    if (hostType !== "http") {
      const status = exception.getStatus();
      const response = exception.getResponse();

      this.logger.error(
        `Exception in [${hostType}] context: ${JSON.stringify(response)}, status - ${status}`,
      );

      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    /*
     * NestJS errors come in two "shapes":
     * 1. Simple String: throw new ForbiddenException('No access') -> "No access"
     * 2. Detailed Object: Validation errors -> { message: ['error1', 'error2'], ... }
     */
    const exceptionResponse = exception.getResponse();

    /**
     * STEP: Extraction
     * If exceptionResponse is an object, it's a built-in Nest error (like Validation).
     * We cast it to our interface to safely grab the 'message' field.
     * Otherwise, it's just a raw string we can use directly.
     */
    const message =
      typeof exceptionResponse === "object"
        ? (exceptionResponse as NestErrorResponse).message
        : exceptionResponse;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message[0] : message, // A single, human-readable string (for Toasts/Alerts).
      details: Array.isArray(message) ? message : null, // The full array of errors (for marking specific form fields)
    });
  }
}
