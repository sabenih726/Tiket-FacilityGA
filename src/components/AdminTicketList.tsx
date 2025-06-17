
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Phone, Play, CheckCircle, Clock, AlertCircle, Trash2 } from "lucide-react";

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

interface Counter {
  id: number;
  name: string;
  status: string;
  currently_serving: string | null;
  service_type_id: string | null;
}

interface AdminTicketListProps {
  tickets: QueueTicket[];
  counters: Counter[];
  onUpdateTicket: (ticketId: string, status: string, counterId?: number) => void;
  onDeleteTicket: (ticketId: string) => void;
  isLoading: boolean;
}

export const AdminTicketList = ({ tickets, counters, onUpdateTicket, onDeleteTicket, isLoading }: AdminTicketListProps) => {
  const [selectedCounter, setSelectedCounter] = useState<number | null>(null);

  // Sort tickets by created_at DESC (newest first)
  const sortedTickets = [...tickets].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

  const activeCounters = counters.filter(c => c.status === 'active');

  const handleCallTicket = (ticketId: string) => {
    if (selectedCounter) {
      onUpdateTicket(ticketId, 'called', selectedCounter);
      setSelectedCounter(null);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-lg">Memuat tiket...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kelola Tiket</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTickets.length > 0 ? (
            sortedTickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-blue-600">
                      {ticket.number}
                    </div>
                    <div>
                      <div className="font-medium">{ticket.customer_name}</div>
                      <div className="text-sm text-gray-500">
                        Dibuat: {formatTime(ticket.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(ticket.status)}>
                      {getStatusText(ticket.status)}
                    </Badge>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {getPriorityText(ticket.priority)}
                    </Badge>
                    
                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Tiket</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus tiket <strong>{ticket.number}</strong> atas nama <strong>{ticket.customer_name}</strong>?
                            <br />
                            <span className="text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan.</span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteTicket(ticket.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Hapus Tiket
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {ticket.purpose && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Keperluan:</strong> {ticket.purpose}
                  </div>
                )}

                {ticket.counter_assigned && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border-l-4 border-blue-500">
                    <strong>Counter:</strong> {counters.find(c => c.id === ticket.counter_assigned)?.name || `Counter ${ticket.counter_assigned}`}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {ticket.status === 'waiting' && (
                    <div className="flex items-center gap-2">
                      <Select value={selectedCounter?.toString() || ""} onValueChange={(value) => setSelectedCounter(parseInt(value))}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Pilih Counter" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCounters.map((counter) => (
                            <SelectItem key={counter.id} value={counter.id.toString()}>
                              {counter.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleCallTicket(ticket.id)}
                        disabled={!selectedCounter}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Panggil
                      </Button>
                    </div>
                  )}

                  {ticket.status === 'called' && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateTicket(ticket.id, 'serving')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Mulai Layani
                    </Button>
                  )}

                  {ticket.status === 'serving' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateTicket(ticket.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Selesai
                    </Button>
                  )}

                  {ticket.status === 'completed' && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Layanan selesai
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              Tidak ada tiket tersedia
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
