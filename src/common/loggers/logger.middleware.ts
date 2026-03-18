import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get("user-agent") || "";
    const start = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      console.log(
        `[${time}] ${method} ${originalUrl} ${statusCode} ${duration}ms - ${userAgent}`,
      );
    });
    next();
  }
}
