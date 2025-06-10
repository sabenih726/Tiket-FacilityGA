
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Play, Square } from "lucide-react";

interface Counter {
  id: number;
  name: string;
  status: string;
  currently_serving: string | null;
  service_type_id: string | null;
}

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

interface AdminCountersProps {
  counters: Counter[];
  tickets: QueueTicket[];
  onUpdateCounter: (counterId: number, status: string, currentlyServing?: string) => void;
}

export const AdminCounters = ({ counters, tickets, onUpdateCounter }: AdminCountersProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'busy': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Tidak Aktif';
      case 'busy': return 'Sibuk';
      default: return status;
    }
  };

  const getCurrentTicket = (counterId: number) => {
    return tickets.find(t => t.counter_assigned === counterId && ['called', 'serving'].includes(t.status));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kelola Counter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {counters.length > 0 ? (
            counters.map((counter) => {
              const currentTicket = getCurrentTicket(counter.id);
              return (
                <div key={counter.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">{counter.name}</div>
                        <Badge variant={getStatusColor(counter.status)}>
                          {getStatusText(counter.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {counter.status === 'inactive' ? (
                        <Button 
                          size="sm" 
                          onClick={() => onUpdateCounter(counter.id, 'active')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Aktifkan
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onUpdateCounter(counter.id, 'inactive')}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Nonaktifkan
                        </Button>
                      )}
                    </div>
                  </div>

                  {currentTicket && (
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-700">
                            Sedang Melayani: {currentTicket.number}
                          </div>
                          <div className="text-sm text-blue-600">
                            {currentTicket.customer_name}
                          </div>
                          {currentTicket.purpose && (
                            <div className="text-sm text-gray-600 mt-1">
                              {currentTicket.purpose}
                            </div>
                          )}
                        </div>
                        <Badge variant={currentTicket.status === 'serving' ? 'destructive' : 'secondary'}>
                          {currentTicket.status === 'serving' ? 'Dilayani' : 'Dipanggil'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {counter.status === 'active' && !currentTicket && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      Counter siap menerima tiket
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">
              Tidak ada counter tersedia
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
