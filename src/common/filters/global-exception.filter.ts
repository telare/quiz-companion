import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppResponse } from "../types";
import { TelegrafArgumentsHost, TelegrafContextType } from "nestjs-telegraf";
import { BotContext } from "../../bot.context";

interface NestErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("GlobalError");
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const hostType = host.getType();
    if (hostType === ("telegraf" as unknown as TelegrafContextType)) {
      const telegrafHost = TelegrafArgumentsHost.create(host);
      const ctx = telegrafHost.getContext<BotContext>();

      console.error("Bot Error:", exception);

      return ctx.reply(
        "❌ An unexpected error occurs. Please, try again later",
      );
    }
    /*
     * NestJS errors come in two "shapes":
     * 1. Simple String: throw new ForbiddenException('No access') -> "No access"
     * 2. Detailed Object: Validation errors -> { message: ['error1', 'error2'], ... }
     */
    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal error";
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
        message: Array.isArray(message) ? message[0] : message, // A single, human-readable string (for Toasts/Alerts).
        details: Array.isArray(message) ? message : null, // The full array of errors (for marking specific form fields)
      },
    };
    response.status(status).json(resp);
  }
}
