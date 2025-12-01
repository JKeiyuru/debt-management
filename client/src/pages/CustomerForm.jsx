import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const CustomerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: 'male',
      maritalStatus: 'single'
    },
    contactInfo: {
      email: '',
      phone: '',
      alternatePhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: ''
      }
    },
    identification: {
      idType: 'national_id',
      idNumber: '',
      idIssueDate: '',
      idExpiryDate: ''
    },
    employment: {
      status: 'employed',
      employer: '',
      occupation: '',
      monthlyIncome: 0
    }
  });

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        address: {
          ...prev.contactInfo.address,
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/customers', formData);
      toast({
        title: 'Success',
        description: 'Customer created successfully'
      });
      navigate(`/customers/${response.data.data.customer._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create customer',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Add New Customer</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.personalInfo.middleName}
                  onChange={(e) => handleChange('personalInfo', 'middleName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.personalInfo.gender}
                  onValueChange={(value) => handleChange('personalInfo', 'gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={formData.personalInfo.maritalStatus}
                  onValueChange={(value) => handleChange('personalInfo', 'maritalStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleChange('contactInfo', 'phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleChange('contactInfo', 'email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.contactInfo.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.contactInfo.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identification */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Identification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idType">ID Type *</Label>
                <Select
                  value={formData.identification.idType}
                  onValueChange={(value) => handleChange('identification', 'idType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idNumber">ID Number *</Label>
                <Input
                  id="idNumber"
                  value={formData.identification.idNumber}
                  onChange={(e) => handleChange('identification', 'idNumber', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employer">Employer</Label>
                <Input
                  id="employer"
                  value={formData.employment.employer}
                  onChange={(e) => handleChange('employment', 'employer', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.employment.occupation}
                  onChange={(e) => handleChange('employment', 'occupation', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income (KES)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.employment.monthlyIncome}
                  onChange={(e) => handleChange('employment', 'monthlyIncome', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/customers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Customer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;