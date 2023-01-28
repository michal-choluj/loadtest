import { IsObject, IsString, ValidateNested } from 'class-validator';
import { FlowOptionsDto, ScenarioOptionsDto } from '@pulseio/core';
import { Type } from 'class-transformer';

class HttpFlowOptionsDto extends FlowOptionsDto {
  @IsString()
  path: string;

  @IsObject()
  payload?: object;

  @IsObject()
  capture?: object;

  @IsObject()
  validate?: object;
}

export class HttpEngineOptions extends ScenarioOptionsDto {
  @ValidateNested({ each: true })
  @Type(() => HttpFlowOptionsDto)
  readonly flow: HttpFlowOptionsDto[];
}
