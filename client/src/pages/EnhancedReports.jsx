import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, 
  Calendar, BarChart3, Download, Filter, Clock, Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const EnhancedReportsSystem = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Sample data - replace with API calls
  const [reportData, setReportData] = useState({
    par: {
      totalPortfolio: 15000000,
      par1: { amount: 450000, loans: 12, percentage: 3.0 },
      par30: { amount: 750000, loans: 18, percentage: 5.0 },
      par60: { amount: 300000, loans: 6, percentage: 2.0 },
      par90: { amount: 150000, loans: 3, percentage: 1.0 },
      totalPAR: { amount: 1650000, loans: 39, percentage: 11.0 }
    },
    loanAging: [
      { range: 'Current', count: 245, amount: 13350000, percentage: 89 },
      { range: '1-30 days', count: 12, amount: 450000, percentage: 3 },
      { range: '31-60 days', count: 18, amount: 750000, percentage: 5 },
      { range: '61-90 days', count: 6, amount: 300000, percentage: 2 },
      { range: '90+ days', count: 3, amount: 150000, percentage: 1 }
    ],
    dailyCollections: [
      { date: '2024-01-01', amount: 125000, count: 45 },
      { date: '2024-01-02', amount: 156000, count: 52 },
      { date: '2024-01-03', amount: 98000, count: 38 },
      { date: '2024-01-04', amount: 187000, count: 61 },
      { date: '2024-01-05', amount: 142000, count: 48 }
    ],
    expectedVsActual: {
      expected: 2500000,
      actual: 2150000,
      missed: 350000,
      partial: 125000,
      overpayments: 75000
    },
    collectorPerformance: [
      { name: 'John Doe', recovered: 450000, outstanding: 1200000, clients: 35, percentage: 37.5 },
      { name: 'Jane Smith', recovered: 680000, outstanding: 980000, clients: 42, percentage: 69.4 },
      { name: 'Bob Wilson', recovered: 520000, outstanding: 1100000, clients: 38, percentage: 47.3 }
    ],
    revenueBreakdown: {
      interestEarned: 1250000,
      processingFees: 180000,
      legalFees: 45000,
      insuranceFees: 60000,
      penalties: 95000,
      total: 1630000
    },
    loanPerformance: {
      totalLoans: 284,
      activeLoans: 245,
      closedLoans: 32,
      defaultedLoans: 7,
      averageTerm: 4.5,
      disbursedThisMonth: 4500000
    }
  });

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

  const formatCurrency = (amount) => `KES ${amount.toLocaleString()}`;

  const exportReport = (reportType) => {
    alert(`Exporting ${reportType} report...`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive portfolio insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="par" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="par">PAR Analysis</TabsTrigger>
          <TabsTrigger value="aging">Loan Aging</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        {/* PAR ANALYSIS TAB */}
        <TabsContent value="par" className="space-y-6">
          {/* PAR Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Portfolio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(reportData.par.totalPortfolio)}
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-blue-500 opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">PAR 1-30</p>
                  <p className="text-3xl font-bold text-green-600">{reportData.par.par1.percentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(reportData.par.par1.amount)}</p>
                  <p className="text-xs text-gray-500">{reportData.par.par1.loans} loans</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">PAR 31-60</p>
                  <p className="text-3xl font-bold text-yellow-600">{reportData.par.par30.percentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(reportData.par.par30.amount)}</p>
                  <p className="text-xs text-gray-500">{reportData.par.par30.loans} loans</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">PAR 61-90</p>
                  <p className="text-3xl font-bold text-orange-600">{reportData.par.par60.percentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(reportData.par.par60.amount)}</p>
                  <p className="text-xs text-gray-500">{reportData.par.par60.loans} loans</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">PAR 90+</p>
                  <p className="text-3xl font-bold text-red-600">{reportData.par.par90.percentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(reportData.par.par90.amount)}</p>
                  <p className="text-xs text-gray-500">{reportData.par.par90.loans} loans</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total PAR Summary */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Total Portfolio at Risk (PAR)</p>
                  <p className="text-4xl font-bold text-red-600">{reportData.par.totalPAR.percentage}%</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {formatCurrency(reportData.par.totalPAR.amount)} from {reportData.par.totalPAR.loans} loans
                  </p>
                </div>
                <div className="text-right">
                  <AlertTriangle className="h-16 w-16 text-red-500 mb-2" />
                  <Button size="sm" variant="outline" className="border-red-300">
                    <Download className="h-4 w-4 mr-1" />
                    Export PAR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PAR Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                PAR Trend Analysis (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { month: 'Jul', par1: 2.5, par30: 4.2, par60: 1.8, par90: 0.8 },
                  { month: 'Aug', par1: 2.8, par30: 4.5, par60: 2.0, par90: 0.9 },
                  { month: 'Sep', par1: 2.6, par30: 4.8, par60: 1.9, par90: 0.9 },
                  { month: 'Oct', par1: 2.9, par30: 4.9, par60: 2.1, par90: 1.0 },
                  { month: 'Nov', par1: 3.0, par30: 5.0, par60: 2.0, par90: 1.0 },
                  { month: 'Dec', par1: 3.0, par30: 5.0, par60: 2.0, par90: 1.0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis label={{ value: 'PAR %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="par1" stackId="1" stroke="#10b981" fill="#10b981" name="PAR 1-30" />
                  <Area type="monotone" dataKey="par30" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="PAR 31-60" />
                  <Area type="monotone" dataKey="par60" stackId="1" stroke="#ef4444" fill="#ef4444" name="PAR 61-90" />
                  <Area type="monotone" dataKey="par90" stackId="1" stroke="#7f1d1d" fill="#7f1d1d" name="PAR 90+" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Target className="h-5 w-5" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">High PAR 31-60 Days (5.0%)</p>
                    <p className="text-sm text-red-700">Immediate follow-up required on 18 accounts totaling KES 750,000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">Rising PAR 1-30 Trend</p>
                    <p className="text-sm text-yellow-700">Early intervention on 12 accounts can prevent progression to higher PAR buckets</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOAN AGING TAB */}
        <TabsContent value="aging" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Loan Aging Analysis</CardTitle>
                <Button size="sm" onClick={() => exportReport('aging')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.loanAging.map((item, index) => {
                  const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-700'];
                  return (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full ${colors[index]} flex items-center justify-center text-white font-bold`}>
                            {item.count}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.range}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(item.amount)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{item.percentage}%</p>
                          <p className="text-xs text-gray-500">of portfolio</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${colors[index]} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Aging Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Distribution by Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.loanAging}
                    dataKey="amount"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.range}: ${entry.percentage}%`}
                  >
                    {reportData.loanAging.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* COLLECTIONS TAB */}
        <TabsContent value="collections" className="space-y-6">
          {/* Expected vs Actual Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Expected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.expectedVsActual.expected)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Actual Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.expectedVsActual.actual)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Missed</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.expectedVsActual.missed)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Partial Payments</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(reportData.expectedVsActual.partial)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Overpayments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(reportData.expectedVsActual.overpayments)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Collections Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Collections Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.dailyCollections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="amount" fill="#3b82f6" name="Amount Collected (KES)" />
                  <Bar dataKey="count" fill="#10b981" name="Number of Payments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Collector Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Collector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-3">Collector</th>
                      <th className="text-right p-3">Recovered</th>
                      <th className="text-right p-3">Outstanding</th>
                      <th className="text-right p-3">Clients</th>
                      <th className="text-right p-3">Recovery Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.collectorPerformance.map((collector, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{collector.name}</td>
                        <td className="p-3 text-right text-green-600 font-semibold">
                          {formatCurrency(collector.recovered)}
                        </td>
                        <td className="p-3 text-right">{formatCurrency(collector.outstanding)}</td>
                        <td className="p-3 text-right">{collector.clients}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${collector.percentage}%` }}
                              />
                            </div>
                            <span className="font-semibold">{collector.percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERFORMANCE TAB */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Total Loans</p>
                <p className="text-3xl font-bold text-gray-900">{reportData.loanPerformance.totalLoans}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>12% from last month</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Active Loans</p>
                <p className="text-3xl font-bold text-green-600">{reportData.loanPerformance.activeLoans}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {((reportData.loanPerformance.activeLoans / reportData.loanPerformance.totalLoans) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Closed Loans</p>
                <p className="text-3xl font-bold text-purple-600">{reportData.loanPerformance.closedLoans}</p>
                <p className="text-xs text-gray-500 mt-2">Successfully completed</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Defaulted</p>
                <p className="text-3xl font-bold text-red-600">{reportData.loanPerformance.defaultedLoans}</p>
                <p className="text-xs text-gray-500 mt-2">Requires action</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Disbursement vs Collection Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { month: 'Jul', disbursed: 3800000, collected: 2100000 },
                  { month: 'Aug', disbursed: 4200000, collected: 2350000 },
                  { month: 'Sep', disbursed: 4000000, collected: 2400000 },
                  { month: 'Oct', disbursed: 4500000, collected: 2200000 },
                  { month: 'Nov', disbursed: 4800000, collected: 2500000 },
                  { month: 'Dec', disbursed: 4500000, collected: 2150000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="disbursed" stroke="#3b82f6" strokeWidth={2} name="Disbursed" />
                  <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name="Collected" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Total Revenue</p>
                  <p className="text-4xl font-bold text-green-600">
                    {formatCurrency(reportData.revenueBreakdown.total)}
                  </p>
                </div>
                <DollarSign className="h-16 w-16 text-green-500 opacity-70" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Interest Earned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.revenueBreakdown.interestEarned)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {((reportData.revenueBreakdown.interestEarned / reportData.revenueBreakdown.total) * 100).toFixed(1)}% of revenue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Processing Fees</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(reportData.revenueBreakdown.processingFees)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {((reportData.revenueBreakdown.processingFees / reportData.revenueBreakdown.total) * 100).toFixed(1)}% of revenue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Penalties</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(reportData.revenueBreakdown.penalties)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {((reportData.revenueBreakdown.penalties / reportData.revenueBreakdown.total) * 100).toFixed(1)}% of revenue
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { category: 'Interest', amount: reportData.revenueBreakdown.interestEarned },
                  { category: 'Processing', amount: reportData.revenueBreakdown.processingFees },
                  { category: 'Legal', amount: reportData.revenueBreakdown.legalFees },
                  { category: 'Insurance', amount: reportData.revenueBreakdown.insuranceFees },
                  { category: 'Penalties', amount: reportData.revenueBreakdown.penalties }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sources Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Interest', value: reportData.revenueBreakdown.interestEarned },
                      { name: 'Processing Fees', value: reportData.revenueBreakdown.processingFees },
                      { name: 'Legal Fees', value: reportData.revenueBreakdown.legalFees },
                      { name: 'Insurance', value: reportData.revenueBreakdown.insuranceFees },
                      { name: 'Penalties', value: reportData.revenueBreakdown.penalties }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${((entry.value / reportData.revenueBreakdown.total) * 100).toFixed(1)}%`}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FORECASTING TAB */}
        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Expected Collections (Next Month)</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(2800000)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Based on repayment schedule</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">At Risk Amount</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(reportData.par.totalPAR.amount)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Potential defaults</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Projected Recovery</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(2450000)}
                </p>
                <p className="text-xs text-gray-500 mt-2">87% collection rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Future Collections Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expected Collections (Next 3 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { month: 'Jan 2025', expected: 2800000, projected: 2450000 },
                  { month: 'Feb 2025', expected: 3100000, projected: 2700000 },
                  { month: 'Mar 2025', expected: 2900000, projected: 2550000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="expected" fill="#3b82f6" name="Expected" />
                  <Bar dataKey="projected" fill="#10b981" name="Projected (87%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Portfolio Growth Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Growth Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { month: 'Jan', portfolio: 15000000, forecast: 15500000 },
                  { month: 'Feb', portfolio: 15500000, forecast: 16200000 },
                  { month: 'Mar', portfolio: 16200000, forecast: 17000000 },
                  { month: 'Apr', forecast: 17800000 },
                  { month: 'May', forecast: 18500000 },
                  { month: 'Jun', forecast: 19200000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Risk Assessment & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">Expected Default Risk: KES 450,000</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Based on current PAR trends, approximately 3-5% of portfolio may default in next quarter
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Recommended Actions</p>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                        <li>Increase collection efforts on PAR 31-60 accounts</li>
                        <li>Review lending criteria for high-risk segments</li>
                        <li>Set aside 3% of portfolio for loan loss provision</li>
                        <li>Implement early warning system for at-risk accounts</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Growth Opportunities</p>
                      <p className="text-sm text-green-700 mt-1">
                        With current collection rate of 87%, portfolio can sustainably grow to KES 19M by June 2025
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReportsSystem;