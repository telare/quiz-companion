import { HttpStatus } from "@nestjs/common";

const ERROR_MAP: Record<string | number, string> = {
  [HttpStatus.UNAUTHORIZED]:
    "⚠️ You must have a Telegram username to participate in quizzes.",
  [HttpStatus.FORBIDDEN]:
    "🔐 You don't have permission to perform this action.",
  [HttpStatus.NOT_FOUND]:
    "🔍 Sorry, we couldn't find that record. It might have been deleted.",
  [HttpStatus.REQUEST_TIMEOUT]:
    "🌐 Connection issue. Please check your internet or try again later.",
  [HttpStatus.SERVICE_UNAVAILABLE]:
    "🤖 The AI is currently busy or unavailable. Please try again in a moment.",
  [HttpStatus.TOO_MANY_REQUESTS]:
    "🤖 The AI is currently busy or unavailable. Please try again in a moment.",
  [HttpStatus.INTERNAL_SERVER_ERROR]:
    "⚡ An unexpected server error occurred. Please try again later.",

  ECONNREFUSED: "🌐 Cannot connect to the service. Please try again later.",
};

/**
 * Utility to extract a user-friendly error message from any caught error using status/error codes.
 */
export const getErrorMessage = (error: unknown): string => {
  const err = error as {
    status?: number;
    statusCode?: number;
    code?: string | number;
    message?: string;
  };

  const code = err.status || err.statusCode || err.code;

  if (code && ERROR_MAP[code]) {
    return ERROR_MAP[code];
  }

  if (err.message) {
    console.error(err.message);
  }

  return "⚡ An unexpected error occurred. Please try again later.";
};
