
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Users, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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

interface AdminReportsProps {
  tickets: QueueTicket[];
}

type SortField = 'number' | 'customer_name' | 'status' | 'priority' | 'created_at' | 'counter_assigned';
type SortDirection = 'asc' | 'desc' | null;

export const AdminReports = ({ tickets }: AdminReportsProps) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const monthlyTickets = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.created_at);
    return ticketDate >= oneMonthAgo;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('created_at');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTickets = () => {
    if (!sortDirection) {
      return monthlyTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return [...monthlyTickets].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null) return sortDirection === 'asc' ? -1 : 1;

      // Convert to comparable values
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    } else if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'secondary';
      case 'called': return 'default';
      case 'serving': return 'destructive';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Menunggu';
      case 'called': return 'Dipanggil';
      case 'serving': return 'Dilayani';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'destructive';
      case 'urgent': return 'secondary';
      case 'normal': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'Darurat';
      case 'urgent': return 'Mendesak';
      case 'normal': return 'Normal';
      default: return priority;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Statistik summary untuk 1 bulan
  const completedTickets = monthlyTickets.filter(t => t.status === 'completed' && t.called_at && t.completed_at);
  const avgWaitTime = completedTickets.length > 0 
    ? completedTickets.reduce((acc, ticket) => {
        const waitTime = new Date(ticket.called_at!).getTime() - new Date(ticket.created_at).getTime();
        return acc + (waitTime / (1000 * 60)); // dalam menit
      }, 0) / completedTickets.length
    : 0;

  const avgServiceTime = completedTickets.length > 0
    ? completedTickets.reduce((acc, ticket) => {
        const serviceTime = new Date(ticket.completed_at!).getTime() - new Date(ticket.called_at!).getTime();
        return acc + (serviceTime / (1000 * 60)); // dalam menit
      }, 0) / completedTickets.length
    : 0;

  const sortedTickets = getSortedTickets();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total 1 Bulan</p>
                <p className="text-2xl font-bold">{monthlyTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold">{monthlyTickets.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Rata-rata Tunggu</p>
                <p className="text-2xl font-bold">{Math.round(avgWaitTime)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Rata-rata Layanan</p>
                <p className="text-2xl font-bold">{Math.round(avgServiceTime)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tiket 1 Bulan Terakhir</CardTitle>
          <p className="text-sm text-gray-600">Klik pada header kolom untuk mengurutkan data</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="number">No. Tiket</SortableHeader>
                <SortableHeader field="customer_name">Nama</SortableHeader>
                <TableHead>Keperluan</TableHead>
                <SortableHeader field="status">Status</SortableHeader>
                <SortableHeader field="priority">Prioritas</SortableHeader>
                <SortableHeader field="created_at">Waktu Dibuat</SortableHeader>
                <SortableHeader field="counter_assigned">Counter</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTickets.length > 0 ? (
                sortedTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.number}</TableCell>
                    <TableCell>{ticket.customer_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{ticket.purpose || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {getPriorityText(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTime(ticket.created_at)}</TableCell>
                    <TableCell>
                      {ticket.counter_assigned ? `Counter ${ticket.counter_assigned}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Belum ada tiket dalam 1 bulan terakhir
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
