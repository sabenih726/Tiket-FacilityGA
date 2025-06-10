
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, FileText, AlertTriangle } from "lucide-react";
import { useState } from "react";

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
  isLoading: boolean;
}

export const AdminTicketList = ({ tickets, counters, onUpdateTicket, isLoading }: AdminTicketListProps) => {
  const [selectedCounter, setSelectedCounter] = useState<{ [key: string]: number }>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'default';
      case 'called': return 'secondary';
      case 'serving': return 'destructive';
      case 'completed': return 'outline';
      default: return 'default';
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
      case 'urgent': return 'default';
      case 'normal': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeCounters = counters.filter(c => c.status === 'active');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kelola Tiket</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8">Memuat tiket...</p>
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
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-blue-600">
                      {ticket.number}
                    </div>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {getStatusText(ticket.status)}
                    </Badge>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(ticket.created_at)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{ticket.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>~{ticket.estimated_wait_time}m</span>
                  </div>
                </div>

                {ticket.purpose && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-500 mt-1" />
                    <p className="text-sm text-gray-600">{ticket.purpose}</p>
                  </div>
                )}

                {ticket.counter_assigned && (
                  <div className="text-sm text-blue-600">
                    Counter: {counters.find(c => c.id === ticket.counter_assigned)?.name}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {ticket.status === 'waiting' && (
                    <>
                      <Select 
                        value={selectedCounter[ticket.id]?.toString() || ""} 
                        onValueChange={(value) => setSelectedCounter(prev => ({ ...prev, [ticket.id]: parseInt(value) }))}
                      >
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
                        onClick={() => onUpdateTicket(ticket.id, 'called', selectedCounter[ticket.id])}
                        disabled={!selectedCounter[ticket.id]}
                      >
                        Panggil
                      </Button>
                    </>
                  )}
                  
                  {ticket.status === 'called' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onUpdateTicket(ticket.id, 'serving')}
                    >
                      Mulai Layani
                    </Button>
                  )}
                  
                  {ticket.status === 'serving' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => onUpdateTicket(ticket.id, 'completed')}
                    >
                      Selesaikan
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">
              Tidak ada tiket
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
