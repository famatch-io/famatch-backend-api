import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export function CodeField() {
  return applyDecorators(ApiProperty(), IsNotEmpty(), IsString(), Length(6, 6));
}
