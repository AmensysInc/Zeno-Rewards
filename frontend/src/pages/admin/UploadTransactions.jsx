import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Navbar from '../../components/shared/Navbar';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Table from '../../components/shared/Table';

function UploadTransactions() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  
  const navigate = useNavigate();

  // Load existing uploads on mount
  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = () => {
    const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
    setRecentUploads(uploads);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcel(selectedFile);
    }
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Get column names
      if (jsonData.length > 0) {
        const cols = Object.keys(jsonData[0]);
        setColumns(cols);
      }
      
      setPreviewData(jsonData);
      setShowPreview(true);
    };
    
    reader.readAsBinaryString(file);
  };

  const handleProceed = () => {
    setUploading(true);
    
    // Save upload summary to localStorage
    const uploadSummary = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      description: file.name,
      count: previewData.length,
      status: 'Approved',
      data: previewData
    };
    
    // Get existing uploads
    const existingUploads = JSON.parse(localStorage.getItem('uploads') || '[]');
    existingUploads.push(uploadSummary);
    localStorage.setItem('uploads', JSON.stringify(existingUploads));
    
    // Add to transactions (append, not replace)
    const existingTransactions = JSON.parse(localStorage.getItem('uploadedTransactions') || '[]');
    const allTransactions = [...existingTransactions, ...previewData];
    localStorage.setItem('uploadedTransactions', JSON.stringify(allTransactions));
    
    setTimeout(() => {
      setUploading(false);
      setShowPreview(false);
      setFile(null);
      setPreviewData(null);
      setColumns([]);
      loadUploads();
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
    }, 1000);
  };

  const handleCancel = () => {
    setFile(null);
    setPreviewData(null);
    setColumns([]);
    setShowPreview(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this upload?')) {
      const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
      const updatedUploads = uploads.filter(upload => upload.id !== id);
      localStorage.setItem('uploads', JSON.stringify(updatedUploads));
      loadUploads();
    }
  };

  const handleEdit = (upload) => {
    setEditingId(upload.id);
    setEditDescription(upload.description);
  };

  const handleSaveEdit = (id) => {
    const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
    const updatedUploads = uploads.map(upload => 
      upload.id === id ? { ...upload, description: editDescription } : upload
    );
    localStorage.setItem('uploads', JSON.stringify(updatedUploads));
    setEditingId(null);
    setEditDescription('');
    loadUploads();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
  };

  // Table columns for preview
  const previewColumns = columns.map(col => ({
    key: col,
    label: col,
    align: 'left'
  }));

  // Table columns for recent uploads
  const uploadsColumns = [
    { key: 'date', label: 'Date', align: 'left' },
    { 
      key: 'description', 
      label: 'Description', 
      align: 'left',
      render: (value, row) => {
        if (editingId === row.id) {
          return (
            <Input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          );
        }
        return value;
      }
    },
    { 
      key: 'count', 
      label: 'Count', 
      align: 'left',
      render: (value) => `${value} records`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/business/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Upload Transactions</h1>
          <p className="text-gray-600">Upload your transaction history Excel file</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📤</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Upload Excel File</h2>
            <p className="text-gray-600 mb-6">
              Select an Excel file (.xlsx, .xls) containing transaction data
            </p>
            
          <label className="inline-block cursor-pointer">
  <input
    id="file-input"
    type="file"
    accept=".xlsx,.xls"
    onChange={handleFileChange}
    className="hidden"
  />
  <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block font-semibold">
    Choose File
  </span>
</label>
            
            {file && !showPreview && (
              <div className="mt-4 text-sm text-gray-600">
                Selected: <span className="font-semibold">{file.name}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Preview Section */}
        {showPreview && (
          <div className="mb-8">
            <Card className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Preview Data</h2>
                  <p className="text-sm text-gray-600">
                    {previewData.length} records from {file.name}
                  </p>
                </div>
                <div className="space-x-3">
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleProceed}
                    disabled={uploading}
                  >
                    {uploading ? 'Processing...' : 'Proceed'}
                  </Button>
                </div>
              </div>
            </Card>

          {/* Preview Data Table */}
<Card>
  <Table
    columns={previewColumns}
    data={previewData}
    emptyMessage="No data to preview"
  />
</Card>
          </div>
        )}

        {/* Recent Uploads Table */}
        {recentUploads.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Uploads</h2>
            <Card>
              <Table
                columns={uploadsColumns}
                data={recentUploads}
                onEdit={handleEdit}
                onDelete={(row) => handleDelete(row.id)}
                emptyMessage="No uploads yet"
              />
              
              {/* Edit Controls */}
              {editingId && (
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="success"
                    onClick={() => handleSaveEdit(editingId)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadTransactions;