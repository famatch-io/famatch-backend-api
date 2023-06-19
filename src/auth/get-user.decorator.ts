import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AWSCognitoPayload } from './models/AwsCognitoPayload';

export const GetCognitoUser = createParamDecorator(
  (data, ctx: ExecutionContext): AWSCognitoPayload => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
