import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from "@prisma/client";

interface ErrorResponseBody {
  success: false;
  error: string;
  message?: string;
}

/**
 * Filtro global de excepciones: normaliza TODAS las respuestas de error a
 * `{ success: false, error, message? }`, sin importar si el error viene de
 * `HttpException` (validaciones, guards, `throw new NotFoundException(...)`,
 * etc.), de Prisma (violaciones de constraint) o de un error inesperado.
 *
 * Nunca se expone el stack trace al cliente (ni siquiera en desarrollo);
 * los detalles completos solo se registran vía `Logger`.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { statusCode, body } = this.resolve(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    } else {
      this.logger.warn(`[${statusCode}] ${body.error}`);
    }

    response.status(statusCode).json(body);
  }

  private resolve(exception: unknown): { statusCode: number; body: ErrorResponseBody } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let error = exception.message;
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as { message?: string | string[]; error?: string };
        if (Array.isArray(responseObj.message)) {
          // ValidationPipe (class-validator) agrupa varios mensajes: se toma
          // el primero para mantener un `error` de una sola línea, legible.
          error = responseObj.message[0];
        } else if (responseObj.message) {
          error = responseObj.message;
        } else if (responseObj.error) {
          error = responseObj.error;
        }
      }

      return { statusCode, body: { success: false, error } };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    const message = exception instanceof Error ? exception.message : 'Error interno del servidor';
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { success: false, error: 'Error interno del servidor', message: this.safeMessage(message) },
    };
  }

  private resolvePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    body: ErrorResponseBody;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          body: { success: false, error: 'El registro ya existe (valor duplicado)' },
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          body: { success: false, error: 'Registro no encontrado' },
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          body: { success: false, error: 'Referencia a un registro inexistente' },
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          body: { success: false, error: 'Error interno del servidor' },
        };
    }
  }

  /** Solo se agrega `message` de detalle cuando NO estamos en producción. */
  private safeMessage(message: string): string | undefined {
    return process.env.NODE_ENV === 'production' ? undefined : message;
  }
}
