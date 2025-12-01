import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Plus, 
  Filter, 
  Briefcase,
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import LoanCard from './LoanCard';

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
    fetchStats();
  }, [search, status, pagination.currentPage]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        search: search || undefined,
        status: status !== 'all' ? status : undefined
      };

      const response = await api.get('/loans', { params });
      setLoans(response.data.data.loans);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/loans/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleQuickPayment = (loan) => {
    navigate(`/payments/new?loanId=${loan._id}`);
  };

  if (loading && loans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Loans</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLoans}</p>
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
                  <p className="text-3xl font-bold text-gray-900">{stats.activeLoans}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingLoans}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Defaulted</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.defaultedLoans}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl font-bold">Loan Portfolio</CardTitle>
            <Button 
              onClick={() => navigate('/loans/new')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Loan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by loan number, customer name..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="defaulted">Defaulted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loan Grid */}
          {loans.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No loans found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first loan</p>
              <Button onClick={() => navigate('/loans/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Loan
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.map((loan) => (
                  <LoanCard 
                    key={loan._id} 
                    loan={loan}
                    onClick={() => navigate(`/loans/${loan._id}`)}
                    onQuickAction={handleQuickPayment}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * 12) + 1} to {Math.min(pagination.currentPage * 12, pagination.total)} of {pagination.total} loans
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={pagination.currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPagination({ ...pagination, currentPage: i + 1 })}
                          className="w-10"
                        >
                          {i + 1}
                        </Button>
                      )).slice(
                        Math.max(0, pagination.currentPage - 3),
                        Math.min(pagination.totalPages, pagination.currentPage + 2)
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanList;