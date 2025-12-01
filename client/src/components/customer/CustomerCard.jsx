import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Phone, Mail, MapPin, Briefcase, TrendingUp } from 'lucide-react';

const CustomerCard = ({ customer, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      blacklisted: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.active;
  };

  const getInitials = () => {
    return `${customer.personalInfo.firstName[0]}${customer.personalInfo.lastName[0]}`.toUpperCase();
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-500"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-blue-100">
              <AvatarImage src={customer.personalInfo.profilePhoto} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {customer.personalInfo.firstName} {customer.personalInfo.lastName}
              </h3>
              <p className="text-xs text-gray-500">ID: {customer.identification.idNumber}</p>
            </div>
          </div>
          <Badge className={getStatusColor(customer.status)}>
            {customer.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-blue-500" />
            <span>{customer.contactInfo.phone}</span>
          </div>
          
          {customer.contactInfo.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="truncate">{customer.contactInfo.email}</span>
            </div>
          )}

          {customer.contactInfo.address?.city && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>{customer.contactInfo.address.city}</span>
            </div>
          )}

          {customer.employment?.occupation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span>{customer.employment.occupation}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-gray-500">Active Loans</p>
            <p className="text-lg font-bold text-gray-900">{customer.creditInfo.activeLoans}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Borrowed</p>
            <p className="text-lg font-bold text-blue-600">
              KES {customer.creditInfo.totalBorrowed.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Credit Score</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-lg font-bold text-gray-900">{customer.creditInfo.creditScore}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;