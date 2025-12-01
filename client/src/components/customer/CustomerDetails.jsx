// client/src/pages/CustomerDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Edit } from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data.data.customer);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!customer) return <div className="text-center py-12">Customer not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => navigate(`/customers/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {customer.personalInfo.firstName} {customer.personalInfo.lastName}
            </CardTitle>
            <Badge>{customer.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>{customer.contactInfo.phone}</span>
              </div>
              {customer.contactInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span>{customer.contactInfo.email}</span>
                </div>
              )}
              {customer.contactInfo.address?.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{customer.contactInfo.address.city}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p><strong>ID Number:</strong> {customer.identification.idNumber}</p>
              <p><strong>Active Loans:</strong> {customer.creditInfo.activeLoans}</p>
              <p><strong>Total Borrowed:</strong> KES {customer.creditInfo.totalBorrowed.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetails;