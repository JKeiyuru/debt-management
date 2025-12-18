// client/src/components/document/DocumentManager.jsx
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { formatDate } from '../../lib/utils';

const DOCUMENT_CATEGORIES = [
  { value: 'contract', label: '📄 Loan Contract', icon: FileText, color: 'blue' },
  { value: 'identification', label: '🪪 Identification', icon: FileText, color: 'purple' },
  { value: 'security_collateral', label: '🔒 Security/Collateral', icon: FileText, color: 'green' },
  { value: 'proof_of_income', label: '💰 Proof of Income', icon: FileText, color: 'yellow' },
  { value: 'bank_statement', label: '🏦 Bank Statement', icon: FileText, color: 'indigo' },
  { value: 'business_registration', label: '🏢 Business Registration', icon: FileText, color: 'pink' },
  { value: 'title_deed', label: '🏠 Title Deed', icon: FileText, color: 'orange' },
  { value: 'logbook', label: '🚗 Vehicle Logbook', icon: FileText, color: 'red' },
  { value: 'guarantor_documents', label: '👥 Guarantor Documents', icon: FileText, color: 'teal' },
  { value: 'payment_receipt', label: '🧾 Payment Receipt', icon: FileText, color: 'cyan' },
  { value: 'other', label: '📎 Other', icon: FileText, color: 'gray' }
];

const DocumentManager = ({ entityType, entityId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  const [uploadForm, setUploadForm] = useState({
    file: null,
    name: '',
    category: 'other',
    description: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, [entityType, entityId, selectedCategory]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await api.get(`/documents/${entityType}/${entityId}`, { params });
      setDocuments(response.data.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 10MB',
          variant: 'destructive'
        });
        return;
      }

      setUploadForm({
        ...uploadForm,
        file,
        name: uploadForm.name || file.name
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.file) {
      toast({
        title: 'Error',
        description: 'Please select a file',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.name);
      formData.append('category', uploadForm.category);
      formData.append('description', uploadForm.description);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);

      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: 'Success! 🎉',
        description: 'Document uploaded successfully'
      });

      setShowUploadForm(false);
      setUploadForm({ file: null, name: '', category: 'other', description: '' });
      fetchDocuments();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId, docName) => {
    try {
      const response = await api.get(`/documents/${docId}/download`);
      // Open in new tab
      window.open(response.data.data.url, '_blank');
      
      toast({
        title: 'Success',
        description: 'Document opened in new tab'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/documents/${docId}`);
      toast({
        title: 'Success',
        description: 'Document deleted successfully'
      });
      fetchDocuments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const getCategoryColor = (category) => {
    const cat = DOCUMENT_CATEGORIES.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const getCategoryIcon = (category) => {
    const cat = DOCUMENT_CATEGORIES.find(c => c.value === category);
    const Icon = cat?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-600">{documents.length} document(s)</p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          {showUploadForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Upload New Document</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">File *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
                </p>
              </div>

              <div>
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="e.g., National ID Copy"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Additional notes about this document..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          All ({documents.length})
        </Button>
        {DOCUMENT_CATEGORIES.map(cat => {
          const count = documents.filter(d => d.category === cat.value).length;
          if (count === 0) return null;
          return (
            <Button
              key={cat.value}
              size="sm"
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label.split(' ')[0]} ({count})
            </Button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents uploaded</h3>
            <p className="text-gray-600 mb-4">Upload your first document to get started</p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <Card key={doc._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {doc.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`bg-${getCategoryColor(doc.category)}-100 text-${getCategoryColor(doc.category)}-800 text-xs`}
                      >
                        {getCategoryIcon(doc.category)}
                        <span className="ml-1">
                          {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label.split(' ').slice(1).join(' ')}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {doc.fileSizeMB} MB • {formatDate(doc.uploadedAt)}
                    </p>
                    {doc.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    {doc.isVerified && (
                      <div className="flex items-center gap-1 mt-2 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(doc._id, doc.name)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(doc._id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentManager;