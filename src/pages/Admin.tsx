import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminTicketList } from "@/components/AdminTicketList";
import { AdminCounters } from "@/components/AdminCounters";
import { AdminReports } from "@/components/AdminReports";
import { AdminDataExport } from "@/components/AdminDataExport";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Link, useNavigate } from "react-router-dom";
import { Home, Users, Settings, LogOut, BarChart3, Download } from "lucide-react";

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

const Admin = () => {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const { toast } = useToast();
  const { isAuthenticated, adminSession, logout, isLoading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
      fetchCounters();
    }
  }, [isAuthenticated]);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('queue_tickets')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat tiket",
        variant: "destructive",
      });
    } else {
      setTickets(data || []);
    }
    setIsLoading(false);
  };

  const fetchCounters = async () => {
    const { data, error } = await supabase
      .from('counters')
      .select('*')
      .order('name');
    
    if (data) {
      setCounters(data);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string, counterId?: number) => {
    const updateData: any = { status };
    
    if (status === 'called') {
      updateData.called_at = new Date().toISOString();
      updateData.counter_assigned = counterId;
    } else if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('queue_tickets')
      .update(updateData)
      .eq('id', ticketId);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal mengupdate status tiket",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Status tiket berhasil diupdate",
      });
      fetchTickets();
      fetchCounters();
    }
  };

  const updateCounterStatus = async (counterId: number, status: string, currentlyServing?: string) => {
    const { error } = await supabase
      .from('counters')
      .update({ 
        status, 
        currently_serving: currentlyServing || null 
      })
      .eq('id', counterId);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal mengupdate counter",
        variant: "destructive",
      });
    } else {
      fetchCounters();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Kelola tiket dan counter facility maintenance
            </p>
            {adminSession && (
              <p className="text-sm text-blue-600">
                Selamat datang, {adminSession.full_name}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Tiket</p>
                  <p className="text-2xl font-bold">{tickets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold">
                    {tickets.filter(t => t.status === 'waiting').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Sedang Dilayani</p>
                  <p className="text-2xl font-bold">
                    {tickets.filter(t => t.status === 'serving').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold">
                    {tickets.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kelola Tiket
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Laporan & Analitik
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Ticket Management */}
              <AdminTicketList 
                tickets={tickets}
                counters={counters}
                onUpdateTicket={updateTicketStatus}
                isLoading={isLoading}
              />
              
              {/* Counter Management */}
              <AdminCounters 
                counters={counters}
                tickets={tickets}
                onUpdateCounter={updateCounterStatus}
              />
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <AdminReports tickets={tickets} />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <AdminDataExport tickets={tickets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
