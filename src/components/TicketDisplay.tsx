
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, FileText, AlertCircle } from "lucide-react";

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

interface TicketDisplayProps {
  ticket: QueueTicket;
}

export const TicketDisplay = ({ ticket }: TicketDisplayProps) => {
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

  return (
    <Card className="border-2 border-green-500 bg-green-50">
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
          <p className="text-sm text-gray-600">Nomor Antrian Anda</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Nama:</span>
            <span className="text-sm">{ticket.customer_name}</span>
          </div>

          {ticket.purpose && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <span className="text-sm font-medium">Keperluan:</span>
                <p className="text-sm text-gray-600 mt-1">{ticket.purpose}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Prioritas:</span>
            <Badge variant={getPriorityColor(ticket.priority)}>
              {getPriorityText(ticket.priority)}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Estimasi Tunggu:</span>
            <span className="text-sm">{ticket.estimated_wait_time} menit</span>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500 mt-4">
          <p className="text-sm text-blue-700">
            <strong>Mohon simpan nomor tiket ini.</strong> Anda akan dipanggil saat giliran tiba.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
