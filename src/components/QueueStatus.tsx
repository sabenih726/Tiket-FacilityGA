
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";

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
}

interface QueueStatusProps {
  tickets: QueueTicket[];
}

export const QueueStatus = ({ tickets }: QueueStatusProps) => {
  const waitingTickets = tickets.filter(ticket => ticket.status === 'waiting');
  const servingTickets = tickets.filter(ticket => ['called', 'serving'].includes(ticket.status));

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Status Antrian
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-yellow-50 rounded border">
              <div className="text-2xl font-bold text-yellow-600">
                {waitingTickets.length}
              </div>
              <div className="text-sm text-yellow-700">Menunggu</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded border">
              <div className="text-2xl font-bold text-blue-600">
                {servingTickets.length}
              </div>
              <div className="text-sm text-blue-700">Sedang Dilayani</div>
            </div>
          </div>

          {/* Current Queue */}
          <div>
            <h4 className="font-medium mb-2">Antrian Terkini:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ticket.number}</span>
                    <span className="text-sm text-gray-600">
                      {ticket.customer_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(ticket.status)}>
                      {getStatusText(ticket.status)}
                    </Badge>
                    {ticket.status === 'waiting' && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {ticket.estimated_wait_time}m
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {tickets.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Belum ada tiket hari ini
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
