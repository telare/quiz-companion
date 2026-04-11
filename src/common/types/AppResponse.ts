import { HttpStatus } from '@nestjs/common';

export interface AppResponse {
  data: unknown;
  error?: {
    details: null | string | string[];
    message: string | string[];
    method: string;
    path: string;
    statusCode: HttpStatus;
    timestamp: string;
  };
  success: boolean;
}
