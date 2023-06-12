import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof HttpException) {
      // Pass through the existing HttpException
      response.status(exception.getStatus()).json(exception.getResponse());
    } else if (exception instanceof Error) {
      // Throw BadRequestException for uncaught errors
      const badRequestException = new BadRequestException(exception.message);
      response
        .status(badRequestException.getStatus())
        .json(badRequestException.getResponse());
    } else {
      // For any other exception, return a generic 500 error
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
