// client/src/pages/Reports.jsx - COMPLETE REPORTS PAGE
// ============================================
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DelinquencyReport } from '../components/reports/DelinquencyReport';
import { PortfolioChart } from '../components/reports/PortfolioChart';
import { ExportButton } from '../components/reports/ExportButton';
import { BarChart3, TrendingDown, PieChart, Download } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive portfolio insights and analysis</p>
        </div>
        <ExportButton type="loans" label="Export All Data" />
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="delinquency" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Delinquency
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioChart />
        </TabsContent>

        <TabsContent value="delinquency" className="space-y-6">
          <DelinquencyReport />
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collection Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Collection analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;