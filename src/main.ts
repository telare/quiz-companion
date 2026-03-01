/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";

let cachedApp: any;
const isProd = process.env.NODE_ENV === "production";

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(new ValidationPipe());
  if (isProd) {
    await app.init();
  } else {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Server is running on http://localhost:${port}`);
  }
  return server;
}
if (!isProd) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bootstrap();
}

export default async (req: any, res: any) => {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp(req, res);
};
