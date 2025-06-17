
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TicketDisplay } from "@/components/TicketDisplay";
import { QueueStatus } from "@/components/QueueStatus";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

interface ServiceType {
  id: string;
  name: string;
  prefix: string;
  current_number: number;
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
  called_at: string | null;
  completed_at: string | null;
}

const Index = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<QueueTicket | null>(null);
  const [queueTickets, setQueueTickets] = useState<QueueTicket[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchServiceTypes();
    fetchQueueTickets();
  }, []);

  const fetchServiceTypes = async () => {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat jenis layanan",
        variant: "destructive",
      });
    } else {
      setServiceTypes(data || []);
    }
  };

  const fetchQueueTickets = async () => {
    const { data, error } = await supabase
      .from('queue_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setQueueTickets(data);
    }
  };

  const generateTicket = async () => {
    if (!selectedServiceType || !customerName.trim()) {
      toast({
        title: "Error",
        description: "Mohon lengkapi nama dan pilih jenis layanan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get service type info
      const selectedService = serviceTypes.find(s => s.id === selectedServiceType);
      if (!selectedService) return;

      // Get current date for daily reset
      const today = new Date().toISOString().split('T')[0];
      
      // Count tickets created today for this service type
      const { data: todayTickets, error: countError } = await supabase
        .from('queue_tickets')
        .select('number')
        .eq('service_type_id', selectedServiceType)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (countError) throw countError;

      // Calculate next number for today
      let nextNumber = 1;
      if (todayTickets && todayTickets.length > 0) {
        // Find the highest number used today
        const lastTicket = todayTickets[0];
        const lastNumberMatch = lastTicket.number.match(/\d+$/);
        if (lastNumberMatch) {
          nextNumber = parseInt(lastNumberMatch[0]) + 1;
        }
      }

      // Generate ticket number with date prefix
      const datePrefix = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const ticketNumber = `${selectedService.prefix}${datePrefix}${nextNumber.toString().padStart(3, '0')}`;

      // Create ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('queue_tickets')
        .insert({
          number: ticketNumber,
          customer_name: customerName,
          purpose: purpose || 'Facility Maintenance',
          priority: priority,
          service_type_id: selectedServiceType,
          status: 'waiting',
          estimated_wait_time: Math.floor(Math.random() * 30) + 10 // Random 10-40 minutes
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Update service type current number (for display purposes)
      await supabase
        .from('service_types')
        .update({ current_number: nextNumber })
        .eq('id', selectedServiceType);

      setCurrentTicket(ticketData);
      setCustomerName("");
      setPurpose("");
      setSelectedServiceType("");
      setPriority("normal");
      fetchQueueTickets();

      toast({
        title: "Berhasil!",
        description: `Tiket ${ticketNumber} berhasil dibuat`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat tiket",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
            <h1 className="text-4xl font-bold text-gray-900">
              Tiket Facility Maintenance
            </h1>
            <Link to="/admin/login">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Ambil nomor antrian untuk layanan maintenance fasilitas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Pengambilan Tiket */}
          <Card>
            <CardHeader>
              <CardTitle>Ambil Nomor Antrian</CardTitle>
              <CardDescription>
                Isi data di bawah untuk mendapatkan nomor tiket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Nama Lengkap</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <Label htmlFor="serviceType">Jenis Layanan</Label>
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="purpose">Keperluan (Opsional)</Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Jelaskan keperluan maintenance..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="priority">Prioritas</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateTicket} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Memproses..." : "Ambil Tiket"}
              </Button>
            </CardContent>
          </Card>

          {/* Status Antrian */}
          <div className="space-y-6">
            {currentTicket && (
              <TicketDisplay ticket={currentTicket} />
            )}
            
            <QueueStatus tickets={queueTickets} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
