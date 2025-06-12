
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, FileText, Database } from "lucide-react";

interface QueueTicket {
  id: string;
  number: string;
  customer_name: string;
  purpose: string;
  status: string;
  priority: string;
  service_type_id: string;
  created_at: string;
  estimated_wait_time: number;
  counter_assigned: number | null;
  called_at: string | null;
  completed_at: string | null;
}

interface AdminDataExportProps {
  tickets: QueueTicket[];
}

export const AdminDataExport = ({ tickets }: AdminDataExportProps) => {
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateFilter, setDateFilter] = useState("today");

  const getFilteredTickets = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at);
      
      switch (dateFilter) {
        case 'today':
          return ticketDate >= today;
        case 'yesterday':
          return ticketDate >= yesterday && ticketDate < today;
        case 'week':
          return ticketDate >= weekAgo;
        case 'month':
          return ticketDate >= monthAgo;
        case 'all':
          return true;
        default:
          return true;
      }
    });
  };

  const exportToCSV = (data: QueueTicket[]) => {
    const headers = [
      'Nomor Tiket',
      'Nama Customer',
      'Keperluan',
      'Status',
      'Prioritas',
      'Waktu Dibuat',
      'Waktu Dipanggil',
      'Waktu Selesai',
      'Counter',
      'Estimasi Tunggu (menit)'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(ticket => [
        ticket.number,
        `"${ticket.customer_name}"`,
        `"${ticket.purpose || ''}"`,
        ticket.status,
        ticket.priority,
        ticket.created_at,
        ticket.called_at || '',
        ticket.completed_at || '',
        ticket.counter_assigned || '',
        ticket.estimated_wait_time
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tiket-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: QueueTicket[]) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tiket-${dateFilter}-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const filteredData = getFilteredTickets();
    
    if (filteredData.length === 0) {
      alert('Tidak ada data untuk periode yang dipilih');
      return;
    }

    if (exportFormat === 'csv') {
      exportToCSV(filteredData);
    } else {
      exportToJSON(filteredData);
    }
  };

  const filteredTickets = getFilteredTickets();
  const statusCounts = {
    waiting: filteredTickets.filter(t => t.status === 'waiting').length,
    called: filteredTickets.filter(t => t.status === 'called').length,
    serving: filteredTickets.filter(t => t.status === 'serving').length,
    completed: filteredTickets.filter(t => t.status === 'completed').length
  };

  const getDateFilterText = (filter: string) => {
    switch (filter) {
      case 'today': return 'Hari Ini';
      case 'yesterday': return 'Kemarin';
      case 'week': return '7 Hari Terakhir';
      case 'month': return '30 Hari Terakhir';
      case 'all': return 'Semua Data';
      default: return filter;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data Tiket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Filter */}
        <div>
          <Label className="text-base font-medium">Filter Periode</Label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="yesterday">Kemarin</SelectItem>
              <SelectItem value="week">7 Hari Terakhir</SelectItem>
              <SelectItem value="month">30 Hari Terakhir</SelectItem>
              <SelectItem value="all">Semua Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div>
          <Label className="text-base font-medium">Format Export</Label>
          <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CSV (Excel Compatible)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                JSON (Raw Data)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded border">
          <h4 className="font-medium mb-3">Preview Data - {getDateFilterText(dateFilter)}</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredTickets.length}</div>
              <div className="text-sm text-gray-600">Total Tiket</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.waiting}</div>
              <div className="text-sm text-gray-600">Menunggu</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.serving}</div>
              <div className="text-sm text-gray-600">Dilayani</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
          </div>

          {filteredTickets.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              Tidak ada data untuk periode yang dipilih
            </p>
          )}
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          className="w-full" 
          size="lg"
          disabled={filteredTickets.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export {exportFormat.toUpperCase()} ({filteredTickets.length} tiket)
        </Button>
      </CardContent>
    </Card>
  );
};
