import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DonationsChartQueryDto } from './dto/donations-chart-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    const data = await this.dashboardService.getStats();
    return { success: true, data };
  }

  @Get('donations-chart')
  async getDonationsChart(@Query() query: DonationsChartQueryDto) {
    const data = await this.dashboardService.getDonationsChart(query.months ?? 6);
    return { success: true, data };
  }
}
