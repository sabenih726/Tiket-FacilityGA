
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText, AlertTriangle } from "lucide-react";

interface TicketDisplayProps {
  ticket: {
    id: string;
    number: string;
    customer_name: string;
    purpose: string;
    status: string;
    priority: string;
    created_at: string;
    estimated_wait_time: number;
  };
}

export const TicketDisplay = ({ ticket }: TicketDisplayProps) => {
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

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-green-700">
          Tiket Berhasil Dibuat!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {ticket.number}
          </div>
          <p className="text-sm text-gray-600">Nomor Tiket Anda</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{ticket.customer_name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{formatTime(ticket.created_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-gray-500" />
            <Badge variant={getPriorityColor(ticket.priority)}>
              {ticket.priority.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>~{ticket.estimated_wait_time} menit</span>
          </div>
        </div>

        {ticket.purpose && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-gray-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Keperluan:</p>
              <p className="text-sm text-gray-600">{ticket.purpose}</p>
            </div>
          </div>
        )}

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            Simpan nomor tiket ini dan tunggu hingga dipanggil
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
