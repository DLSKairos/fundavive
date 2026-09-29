import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

const DEFAULT_MONTHS = 6;
const MAX_MONTHS = 24;

export class DonationsChartQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_MONTHS)
  months?: number = DEFAULT_MONTHS;
}
