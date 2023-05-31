// src/auth/cognito/cognito.module.ts

import { Module } from '@nestjs/common';
import { CognitoService } from './cognito.service';

@Module({
  providers: [CognitoService],
  exports: [CognitoService], // export CognitoService to make it available in other modules
})
export class CognitoModule {}
