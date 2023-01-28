import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DataTransferObject } from './core.dto';
import { Type } from 'class-transformer';

export interface IEngineOptions {
  maxRateLimit: number;
  maxVirtualUsers: number;
  target: string;
  name: string;
}

export interface IFlowOptions {
  type: string;
}

export interface IScenarioOptions {
  engine: IEngineOptions;
  flow: IFlowOptions[];
}

export class EngineOptionsDto implements IEngineOptions {
  @IsNumber()
  maxRateLimit: number;
  @IsNumber()
  maxVirtualUsers: number;
  @IsString()
  target: string;
  @IsString()
  name: string;
}

export class FlowOptionsDto implements IFlowOptions {
  @IsString()
  type: string;
}

export class ScenarioOptionsDto
  extends DataTransferObject
  implements IScenarioOptions
{
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EngineOptionsDto)
  readonly engine: EngineOptionsDto;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FlowOptionsDto)
  readonly flow: FlowOptionsDto[];

  /**
   * Number of virtual users
   *
   * @type {Number}
   * @memberof Engine
   */
  public get maxRateLimit(): number {
    return this.engine.maxRateLimit || 0;
  }

  /**
   * A rate limit is the number of API calls
   *
   * @type {Number}
   * @memberof Engine
   */
  public get maxVirtualUsers(): number {
    return this.engine.maxVirtualUsers || 0;
  }

  /**
   * Returns engine name
   *
   * @type {String}
   * @memberof Engine
   */
  public get engineName(): string {
    return this.engine.name;
  }

  /**
   * Returns target URL
   *
   * @type {String}
   * @memberof Engine
   */
  public get target(): string {
    return this.engine.target;
  }
}
