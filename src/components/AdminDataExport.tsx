
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Table } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [exportFormat, setExportFormat] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const filterTicketsByDate = (tickets: QueueTicket[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at);
      switch (dateFilter) {
        case 'today':
          return ticketDate >= today;
        case 'yesterday':
          return ticketDate >= yesterday && ticketDate < today;
        case 'week':
          return ticketDate >= thisWeek;
        case 'month':
          return ticketDate >= thisMonth;
        default:
          return true;
      }
    });
  };

  const exportToCSV = () => {
    const filteredTickets = filterTicketsByDate(tickets);
    const headers = [
      'Nomor Tiket',
      'Nama Customer',
      'Keperluan',
      'Status',
      'Prioritas',
      'Waktu Dibuat',
      'Dipanggil',
      'Selesai',
      'Counter',
      'Estimasi Tunggu (menit)'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredTickets.map(ticket => [
        ticket.number,
        ticket.customer_name || '',
        ticket.purpose || '',
        ticket.status,
        ticket.priority,
        formatDate(ticket.created_at),
        ticket.called_at ? formatDate(ticket.called_at) : '',
        ticket.completed_at ? formatDate(ticket.completed_at) : '',
        ticket.counter_assigned || '',
        ticket.estimated_wait_time || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tiket-rekap-${dateFilter}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Berhasil",
      description: `Data tiket (${filteredTickets.length} tiket) berhasil diexport ke CSV`,
    });
  };

  const exportToJSON = () => {
    const filteredTickets = filterTicketsByDate(tickets);
    const jsonContent = JSON.stringify(filteredTickets, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tiket-rekap-${dateFilter}-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Berhasil",
      description: `Data tiket (${filteredTickets.length} tiket) berhasil diexport ke JSON`,
    });
  };

  const handleExport = () => {
    if (!exportFormat) {
      toast({
        title: "Error",
        description: "Pilih format export terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    switch (exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      default:
        break;
    }
  };

  const filteredTickets = filterTicketsByDate(tickets);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data Rekap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Filter Tanggal</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih periode" />
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

          <div>
            <label className="text-sm font-medium">Format Export</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Table className="h-4 w-4" />
            <span className="font-medium">Preview Data</span>
          </div>
          <p className="text-sm text-gray-600">
            Total tiket yang akan diexport: <span className="font-bold">{filteredTickets.length}</span>
          </p>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>Menunggu: {filteredTickets.filter(t => t.status === 'waiting').length}</div>
            <div>Dipanggil: {filteredTickets.filter(t => t.status === 'called').length}</div>
            <div>Dilayani: {filteredTickets.filter(t => t.status === 'serving').length}</div>
            <div>Selesai: {filteredTickets.filter(t => t.status === 'completed').length}</div>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          className="w-full"
          disabled={!exportFormat || filteredTickets.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data ({filteredTickets.length} tiket)
        </Button>
      </CardContent>
    </Card>
  );
};
