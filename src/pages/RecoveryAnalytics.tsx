import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  TrendingUp, 
  DollarSign, 
  Users,
  ArrowUp,
  ArrowDown,
  Activity
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

interface ChannelStats {
  channel: string;
  sent: number;
  engaged: number;
  converted: number;
  engagementRate: number;
  conversionRate: number;
  cost: number;
  revenue: number;
  roi: number;
}

interface SequenceStats {
  sequence: number;
  email_sent: number;
  email_opened: number;
  email_clicked: number;
  email_converted: number;
  sms_sent: number;
  sms_delivered: number;
  sms_converted: number;
  whatsapp_sent: number;
  whatsapp_read: number;
  whatsapp_converted: number;
}

export default function RecoveryAnalytics() {
  // Fetch Email Stats
  const { data: emailStats } = useQuery({
    queryKey: ['email-recovery-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkout_abandonment_emails' as any)
        .select('*');
      
      if (error) throw error;
      return data as any[] || [];
    }
  });

  // Fetch SMS Stats
  const { data: smsStats } = useQuery({
    queryKey: ['sms-recovery-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkout_abandonment_sms' as any)
        .select('*');
      
      if (error) throw error;
      return data as any[] || [];
    }
  });

  // Fetch WhatsApp Stats
  const { data: whatsappStats } = useQuery({
    queryKey: ['whatsapp-recovery-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkout_abandonment_whatsapp' as any)
        .select('*');
      
      if (error) throw error;
      return data as any[] || [];
    }
  });

  // Fetch Checkout Sessions for Revenue Calculation
  const { data: checkoutSessions } = useQuery({
    queryKey: ['checkout-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkout_sessions' as any)
        .select('*')
        .eq('abandoned', true);
      
      if (error) throw error;
      return data as any[] || [];
    }
  });

  // Calculate Channel Performance
  const calculateChannelStats = (): ChannelStats[] => {
    const avgCoursePrice = 500; // £500 average course price
    const emailCost = 0; // Free on Brevo free tier
    const smsCost = 0.038; // £0.038 per SMS
    const whatsappCost = 0.03; // £0.03 per WhatsApp

    const emailConverted = emailStats?.filter(e => e.converted).length || 0;
    const smsConverted = smsStats?.filter(s => s.converted).length || 0;
    const whatsappConverted = whatsappStats?.filter(w => w.converted).length || 0;

    return [
      {
        channel: 'Email',
        sent: emailStats?.length || 0,
        engaged: emailStats?.filter(e => e.opened).length || 0,
        converted: emailConverted,
        engagementRate: emailStats?.length ? ((emailStats.filter(e => e.opened).length / emailStats.length) * 100) : 0,
        conversionRate: emailStats?.length ? ((emailConverted / emailStats.length) * 100) : 0,
        cost: (emailStats?.length || 0) * emailCost,
        revenue: emailConverted * avgCoursePrice,
        roi: emailStats?.length ? (((emailConverted * avgCoursePrice) - ((emailStats?.length || 0) * emailCost)) / ((emailStats?.length || 0) * emailCost || 1)) * 100 : 0
      },
      {
        channel: 'SMS',
        sent: smsStats?.length || 0,
        engaged: smsStats?.filter(s => s.delivered).length || 0,
        converted: smsConverted,
        engagementRate: smsStats?.length ? ((smsStats.filter(s => s.delivered).length / smsStats.length) * 100) : 0,
        conversionRate: smsStats?.length ? ((smsConverted / smsStats.length) * 100) : 0,
        cost: (smsStats?.length || 0) * smsCost,
        revenue: smsConverted * avgCoursePrice,
        roi: (smsStats?.length || 0) * smsCost ? (((smsConverted * avgCoursePrice) - ((smsStats?.length || 0) * smsCost)) / ((smsStats?.length || 0) * smsCost)) * 100 : 0
      },
      {
        channel: 'WhatsApp',
        sent: whatsappStats?.length || 0,
        engaged: whatsappStats?.filter(w => w.read).length || 0,
        converted: whatsappConverted,
        engagementRate: whatsappStats?.length ? ((whatsappStats.filter(w => w.read).length / whatsappStats.length) * 100) : 0,
        conversionRate: whatsappStats?.length ? ((whatsappConverted / whatsappStats.length) * 100) : 0,
        cost: (whatsappStats?.length || 0) * whatsappCost,
        revenue: whatsappConverted * avgCoursePrice,
        roi: (whatsappStats?.length || 0) * whatsappCost ? (((whatsappConverted * avgCoursePrice) - ((whatsappStats?.length || 0) * whatsappCost)) / ((whatsappStats?.length || 0) * whatsappCost)) * 100 : 0
      }
    ];
  };

  // Calculate Sequence Performance
  const calculateSequenceStats = (): SequenceStats[] => {
    const sequences = [1, 2, 3];
    return sequences.map(seq => ({
      sequence: seq,
      email_sent: emailStats?.filter(e => e.email_sequence_number === seq).length || 0,
      email_opened: emailStats?.filter(e => e.email_sequence_number === seq && e.opened).length || 0,
      email_clicked: emailStats?.filter(e => e.email_sequence_number === seq && e.clicked).length || 0,
      email_converted: emailStats?.filter(e => e.email_sequence_number === seq && e.converted).length || 0,
      sms_sent: smsStats?.filter(s => s.sms_sequence_number === seq).length || 0,
      sms_delivered: smsStats?.filter(s => s.sms_sequence_number === seq && s.delivered).length || 0,
      sms_converted: smsStats?.filter(s => s.sms_sequence_number === seq && s.converted).length || 0,
      whatsapp_sent: whatsappStats?.filter(w => w.whatsapp_sequence_number === seq).length || 0,
      whatsapp_read: whatsappStats?.filter(w => w.whatsapp_sequence_number === seq && w.read).length || 0,
      whatsapp_converted: whatsappStats?.filter(w => w.whatsapp_sequence_number === seq && w.converted).length || 0,
    }));
  };

  const channelStats = calculateChannelStats();
  const sequenceStats = calculateSequenceStats();

  const totalSent = channelStats.reduce((sum, stat) => sum + stat.sent, 0);
  const totalConverted = channelStats.reduce((sum, stat) => sum + stat.converted, 0);
  const totalCost = channelStats.reduce((sum, stat) => sum + stat.cost, 0);
  const totalRevenue = channelStats.reduce((sum, stat) => sum + stat.revenue, 0);
  const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Recovery Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Multi-channel abandoned checkout recovery performance
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-primary" />
              <Badge variant="outline">Total</Badge>
            </div>
            <h3 className="text-2xl font-bold">{totalSent}</h3>
            <p className="text-sm text-muted-foreground">Messages Sent</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <Badge variant="outline" className="bg-green-50">
                <ArrowUp className="w-3 h-3 mr-1" />
                {totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold">{totalConverted}</h3>
            <p className="text-sm text-muted-foreground">Conversions</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-blue-500" />
              <Badge variant="outline">Revenue</Badge>
            </div>
            <h3 className="text-2xl font-bold">£{totalRevenue.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Recovered</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-purple-500" />
              <Badge variant="outline" className="bg-purple-50">
                {overallROI > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {overallROI.toFixed(0)}x
              </Badge>
            </div>
            <h3 className="text-2xl font-bold">£{totalCost.toFixed(2)}</h3>
            <p className="text-sm text-muted-foreground">Total Cost</p>
          </Card>
        </div>

        {/* Channel Comparison */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Channel Performance Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {channelStats.map((stat, index) => (
              <Card key={stat.channel} className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {stat.channel === 'Email' && <Mail className="w-6 h-6 text-primary" />}
                    {stat.channel === 'SMS' && <Phone className="w-6 h-6 text-green-500" />}
                    {stat.channel === 'WhatsApp' && <MessageSquare className="w-6 h-6 text-blue-500" />}
                    <h3 className="text-xl font-bold">{stat.channel}</h3>
                  </div>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {stat.conversionRate.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sent</span>
                    <span className="font-semibold">{stat.sent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Engaged</span>
                    <span className="font-semibold">{stat.engaged} ({stat.engagementRate.toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Converted</span>
                    <span className="font-semibold text-green-600">{stat.converted}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Cost</span>
                      <span className="font-semibold">£{stat.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="font-semibold text-green-600">£{stat.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">ROI</span>
                      <span className="font-bold text-purple-600">{stat.roi > 0 ? `${stat.roi.toFixed(0)}x` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" fill="#FF6B6B" name="Sent" />
              <Bar dataKey="engaged" fill="#4ECDC4" name="Engaged" />
              <Bar dataKey="converted" fill="#45B7D1" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sequence Performance */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">Sequence Performance</h2>
          <Tabs defaultValue="conversion" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conversion">Conversion Rates</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="volume">Message Volume</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversion" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sequenceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sequence" tickFormatter={(value) => `Step ${value}`} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="email_converted" 
                    stroke="#FF6B6B" 
                    name="Email Conversions" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sms_converted" 
                    stroke="#4ECDC4" 
                    name="SMS Conversions" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="whatsapp_converted" 
                    stroke="#45B7D1" 
                    name="WhatsApp Conversions" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="engagement" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sequenceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sequence" tickFormatter={(value) => `Step ${value}`} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="email_opened" fill="#FF6B6B" name="Email Opens" />
                  <Bar dataKey="sms_delivered" fill="#4ECDC4" name="SMS Delivered" />
                  <Bar dataKey="whatsapp_read" fill="#45B7D1" name="WhatsApp Reads" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="volume" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sequenceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sequence" tickFormatter={(value) => `Step ${value}`} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="email_sent" fill="#FF6B6B" name="Email Sent" />
                  <Bar dataKey="sms_sent" fill="#4ECDC4" name="SMS Sent" />
                  <Bar dataKey="whatsapp_sent" fill="#45B7D1" name="WhatsApp Sent" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </Card>

        {/* ROI Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Cost-Effectiveness</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channelStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.channel}: £${entry.cost.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cost"
                >
                  {channelStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Revenue Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channelStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.channel}: £${entry.revenue}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {channelStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
