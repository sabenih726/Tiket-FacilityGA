
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, Users, CheckCircle } from "lucide-react";

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

export const AdminReports = ({ tickets }: AdminReportsProps) => {
  const today = new Date();
  const todayTickets = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.created_at);
    return ticketDate.toDateString() === today.toDateString();
  });

  // Statistik per status
  const statusData = [
    { name: 'Menunggu', value: todayTickets.filter(t => t.status === 'waiting').length, color: '#f59e0b' },
    { name: 'Dipanggil', value: todayTickets.filter(t => t.status === 'called').length, color: '#3b82f6' },
    { name: 'Dilayani', value: todayTickets.filter(t => t.status === 'serving').length, color: '#ef4444' },
    { name: 'Selesai', value: todayTickets.filter(t => t.status === 'completed').length, color: '#10b981' }
  ];

  // Statistik per jam (hari ini)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const ticketsInHour = todayTickets.filter(ticket => {
      const ticketHour = new Date(ticket.created_at).getHours();
      return ticketHour === hour;
    });
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      tiket: ticketsInHour.length
    };
  }).filter(data => data.tiket > 0);

  // Rata-rata waktu tunggu
  const completedTickets = todayTickets.filter(t => t.status === 'completed' && t.called_at && t.completed_at);
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Hari Ini</p>
                <p className="text-2xl font-bold">{todayTickets.length}</p>
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
                <p className="text-2xl font-bold">{statusData[3].value}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Tiket Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Tiket per Jam (Hari Ini)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tiket" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
