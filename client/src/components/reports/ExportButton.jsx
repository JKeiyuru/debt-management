// client/src/components/reports/ExportButton.jsx
// ============================================
import { useState } from 'react';
import { Button } from '../ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import api from '../../lib/api';
import { useToast } from '../ui/use-toast';

export const ExportButton = ({ type = 'loans', label = 'Export Data' }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/export/${type}`, {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        // Download CSV
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Download JSON
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_export_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast({
        title: 'Success',
        description: `${type} data exported successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to export data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};