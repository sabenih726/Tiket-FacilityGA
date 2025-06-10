
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

interface QueueStatusProps {
  tickets: Array<{
    id: string;
    number: string;
    customer_name: string;
    status: string;
    priority: string;
    created_at: string;
    estimated_wait_time: number;
  }>;
}

export const QueueStatus = ({ tickets }: QueueStatusProps) => {
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

  const waitingTickets = tickets.filter(t => t.status === 'waiting');
  const activeTickets = tickets.filter(t => ['called', 'serving'].includes(t.status));

  return (
    <div className="space-y-4">
      {/* Status Antrian Aktif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sedang Dilayani
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTickets.length > 0 ? (
            <div className="space-y-2">
              {activeTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div>
                    <div className="font-bold text-blue-600">{ticket.number}</div>
                    <div className="text-sm text-gray-600">{ticket.customer_name}</div>
                  </div>
                  <Badge variant={getStatusColor(ticket.status)}>
                    {getStatusText(ticket.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Tidak ada antrian yang sedang dilayani
            </p>
          )}
        </CardContent>
      </Card>

      {/* Antrian Menunggu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Antrian Menunggu ({waitingTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waitingTickets.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {waitingTickets.map((ticket, index) => (
                <div 
                  key={ticket.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{ticket.number}</div>
                      <div className="text-sm text-gray-600">{ticket.customer_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      ~{ticket.estimated_wait_time}m
                    </div>
                    {ticket.priority !== 'normal' && (
                      <Badge variant="outline" className="text-xs">
                        {ticket.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Tidak ada antrian menunggu
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
