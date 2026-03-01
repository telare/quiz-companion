/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";

let cachedApp: any;

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(new ValidationPipe());

  // Important: Use a prefix if your webhook path starts with /api
  // app.setGlobalPrefix('api');

  await app.init();
  return server;
}

export default async (req: any, res: any) => {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp(req, res);
};
