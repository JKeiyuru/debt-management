import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Search, UserPlus, Phone, Mail, MapPin, 
  TrendingUp, AlertCircle, Users, Filter
} from 'lucide-react';
import CustomerCard from './CustomerCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
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
    fetchCustomers();
    fetchStats();
  }, [search, status, pagination.currentPage]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        search: search || undefined,
        status: status !== 'all' ? status : undefined
      };

      const response = await api.get('/customers', { params });
      setCustomers(response.data.data.customers);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/customers/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      blacklisted: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.active;
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
                <Users className="h-12 w-12 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeCustomers}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Blacklisted</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.blacklistedCustomers}</p>
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
            <CardTitle className="text-2xl font-bold">Customers</CardTitle>
            <Button 
              onClick={() => navigate('/customers/new')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or ID..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Grid */}
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first customer</p>
              <Button onClick={() => navigate('/customers/new')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                  <CustomerCard 
                    key={customer._id} 
                    customer={customer}
                    onClick={() => navigate(`/customers/${customer._id}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * 12) + 1} to {Math.min(pagination.currentPage * 12, pagination.total)} of {pagination.total} customers
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

export default CustomerList;