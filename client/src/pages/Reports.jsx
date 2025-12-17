import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  BarChart3, TrendingDown, PieChart, Download, DollarSign, 
  Users, Briefcase, AlertCircle, TrendingUp, Calendar, 
  Clock, Target, Filter, LineChart
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart as RechartsLine, Line, 
  PieChart as RechartsPie, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { DelinquencyReport } from '../components/reports/DelinquencyReport';
import { PortfolioChart } from '../components/reports/PortfolioChart';
import { ExportButton } from '../components/reports/ExportButton';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  
  // State for different report data
  const [dashboardData, setDashboardData] = useState(null);
  const [parData, setParData] = useState(null);
  const [collectionsData, setCollectionsData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

  useEffect(() => {
    fetchDashboardData();
    fetchPARData();
    fetchCollectionsData();
    fetchRevenueData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPARData = async () => {
    try {
      const response = await api.get('/reports/enhanced/par');
      setParData(response.data.data);
    } catch (error) {
      console.error('Error fetching PAR data:', error);
    }
  };

  const fetchCollectionsData = async () => {
    try {
      const response = await api.get('/reports/enhanced/collections/expected-vs-actual');
      setCollectionsData(response.data.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const response = await api.get('/reports/enhanced/revenue');
      setRevenueData(response.data.data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  const formatCurrency = (amount) => `KES ${amount?.toLocaleString() || 0}`;

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
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
          <ExportButton type="loans" label="Export Data" />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="par">PAR Analysis</TabsTrigger>
          <TabsTrigger value="delinquency">Delinquency</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardData && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Loans</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {dashboardData.portfolio?.totalLoans || 0}
                        </p>
                      </div>
                      <Briefcase className="h-12 w-12 text-blue-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Loans</p>
                        <p className="text-3xl font-bold text-green-600">
                          {dashboardData.portfolio?.activeLoans || 0}
                        </p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-green-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-3xl font-bold text-orange-600">
                          {dashboardData.customers?.total || 0}
                        </p>
                      </div>
                      <Users className="h-12 w-12 text-orange-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Portfolio Value</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(dashboardData.portfolio?.totalValue)}
                        </p>
                      </div>
                      <DollarSign className="h-12 w-12 text-red-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Collections Today */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Collections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Amount Collected</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(dashboardData.collections?.today?.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Number of Payments</span>
                        <span className="text-xl font-semibold">
                          {dashboardData.collections?.today?.count || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>This Month's Collections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Amount Collected</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(dashboardData.collections?.thisMonth?.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Number of Payments</span>
                        <span className="text-xl font-semibold">
                          {dashboardData.collections?.thisMonth?.count || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Loans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recentActivity?.loans?.slice(0, 5).map((loan) => (
                        <div key={loan._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                          <div>
                            <p className="font-semibold">{loan.loanNumber}</p>
                            <p className="text-sm text-gray-600">
                              {loan.customer?.personalInfo?.firstName} {loan.customer?.personalInfo?.lastName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(loan.principal)}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              loan.status === 'active' ? 'bg-green-100 text-green-800' :
                              loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {loan.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recentActivity?.payments?.slice(0, 5).map((payment) => (
                        <div key={payment._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                          <div>
                            <p className="font-semibold">{payment.paymentNumber}</p>
                            <p className="text-sm text-gray-600">
                              {payment.customer?.personalInfo?.firstName} {payment.customer?.personalInfo?.lastName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* PAR ANALYSIS TAB */}
        <TabsContent value="par" className="space-y-6">
          {parData && (
            <>
              {/* PAR Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Portfolio</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(parData.totalPortfolio)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">PAR 1-30</p>
                      <p className="text-3xl font-bold text-green-600">{parData.par1?.percentage}%</p>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(parData.par1?.amount)}</p>
                      <p className="text-xs text-gray-500">{parData.par1?.loans} loans</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">PAR 31-60</p>
                      <p className="text-3xl font-bold text-yellow-600">{parData.par30?.percentage}%</p>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(parData.par30?.amount)}</p>
                      <p className="text-xs text-gray-500">{parData.par30?.loans} loans</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">PAR 61-90</p>
                      <p className="text-3xl font-bold text-orange-600">{parData.par60?.percentage}%</p>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(parData.par60?.amount)}</p>
                      <p className="text-xs text-gray-500">{parData.par60?.loans} loans</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">PAR 90+</p>
                      <p className="text-3xl font-bold text-red-600">{parData.par90?.percentage}%</p>
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(parData.par90?.amount)}</p>
                      <p className="text-xs text-gray-500">{parData.par90?.loans} loans</p>
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
                      <p className="text-4xl font-bold text-red-600">{parData.totalPAR?.percentage}%</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {formatCurrency(parData.totalPAR?.amount)} from {parData.totalPAR?.loans} loans
                      </p>
                    </div>
                    <div className="text-right">
                      <AlertCircle className="h-16 w-16 text-red-500 mb-2" />
                      <Button size="sm" variant="outline" className="border-red-300">
                        <Download className="h-4 w-4 mr-1" />
                        Export PAR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PAR Trend Chart */}
              {parData.parTrend && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      PAR Trend Analysis (Last 6 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={parData.parTrend}>
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
              )}

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
                    {parData.par30?.loans > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900">High PAR 31-60 Days ({parData.par30.percentage}%)</p>
                          <p className="text-sm text-red-700">
                            Immediate follow-up required on {parData.par30.loans} accounts totaling {formatCurrency(parData.par30.amount)}
                          </p>
                        </div>
                      </div>
                    )}
                    {parData.par1?.loans > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-900">Rising PAR 1-30 Trend</p>
                          <p className="text-sm text-yellow-700">
                            Early intervention on {parData.par1.loans} accounts can prevent progression to higher PAR buckets
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* DELINQUENCY TAB */}
        <TabsContent value="delinquency" className="space-y-6">
          <DelinquencyReport />
        </TabsContent>

        {/* PORTFOLIO TAB */}
        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioChart />
        </TabsContent>

        {/* COLLECTIONS TAB */}
        <TabsContent value="collections" className="space-y-6">
          {collectionsData && (
            <>
              {/* Expected vs Actual Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Expected</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(collectionsData.expected)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Actual Collected</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(collectionsData.actual)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {collectionsData.collectionRate}% rate
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Missed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(collectionsData.missed)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Partial Payments</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {formatCurrency(collectionsData.partial)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Collection Rate Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Collection Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Collection Rate</span>
                        <span className="text-sm font-bold">{collectionsData.collectionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full flex items-center justify-end px-2"
                          style={{ width: `${collectionsData.collectionRate}%` }}
                        >
                          <span className="text-xs text-white font-semibold">
                            {collectionsData.collectionRate}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6">
          {revenueData && (
            <>
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Total Revenue</p>
                      <p className="text-4xl font-bold text-green-600">
                        {formatCurrency(revenueData.total)}
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
                      {formatCurrency(revenueData.interestEarned)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {((revenueData.interestEarned / revenueData.total) * 100).toFixed(1)}% of revenue
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Processing Fees</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(revenueData.processingFees)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {((revenueData.processingFees / revenueData.total) * 100).toFixed(1)}% of revenue
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-1">Penalties</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(revenueData.penalties)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {((revenueData.penalties / revenueData.total) * 100).toFixed(1)}% of revenue
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { category: 'Interest', amount: revenueData.interestEarned },
                      { category: 'Processing', amount: revenueData.processingFees },
                      { category: 'Legal', amount: revenueData.legalFees },
                      { category: 'Insurance', amount: revenueData.insuranceFees },
                      { category: 'Penalties', amount: revenueData.penalties }
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
            </>
          )}
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
                  {formatCurrency(parData?.totalPAR?.amount || 0)}
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
                <RechartsLine data={[
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
                </RechartsLine>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Risk Assessment & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
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

          {/* Key Metrics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Forecasting Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Assumptions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Collection Rate:</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Loan Size:</span>
                      <span className="font-semibold">KES 52,817</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Term:</span>
                      <span className="font-semibold">4.5 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Default Rate:</span>
                      <span className="font-semibold text-red-600">2.5%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Projected Outcomes (Q1 2025)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Disbursements:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(13500000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Collections:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(8600000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Portfolio Growth:</span>
                      <span className="font-semibold text-purple-600">+13.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected PAR:</span>
                      <span className="font-semibold text-orange-600">11-13%</span>
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

export default Reports;