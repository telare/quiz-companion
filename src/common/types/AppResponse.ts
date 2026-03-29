import { HttpStatus } from "@nestjs/common";

export interface AppResponse {
  success: boolean;
  data: unknown;
  error?: {
    statusCode: HttpStatus;
    timestamp: string;
    path: string;
    method: string;
    message: string | string[];
    details: string | string[] | null;
  };
}
