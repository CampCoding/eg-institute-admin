import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Activity, 
  CreditCard, 
  GraduationCap,
  Clock,
  Eye,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  LogIn,
  UserPlus,
  BarChart3
} from 'lucide-react';

export default function ReportGeneral() {
  const [selectedDateRange, setSelectedDateRange] = useState('7');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Sample data for different activities
  const activities = [
    {
      id: 1,
      type: 'login',
      student: 'محمد حسين',
      email: 'mohammed.hussein@email.com',
      timestamp: '2025-08-12 09:30',
      details: 'Logged in from mobile device',
      icon: LogIn,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 2,
      type: 'payment',
      student: 'ليلى سامي',
      email: 'layla.samy@email.com',
      timestamp: '2025-08-12 08:15',
      details: 'Paid $150 for Advanced Arabic Course',
      amount: 150,
      icon: CreditCard,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 3,
      type: 'enrollment',
      student: 'أحمد علي',
      email: 'ahmed.ali@email.com',
      timestamp: '2025-08-12 07:45',
      details: 'Enrolled in Classical Arabic Poetry',
      course: 'Classical Arabic Poetry',
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 4,
      type: 'login',
      student: 'فاطمة عبدالله',
      email: 'fatima.abdullah@email.com',
      timestamp: '2025-08-11 20:22',
      details: 'Logged in from desktop',
      icon: LogIn,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 5,
      type: 'payment',
      student: 'عمر حسان',
      email: 'omar.hassan@email.com',
      timestamp: '2025-08-11 16:30',
      details: 'Paid $200 for Premium Package',
      amount: 200,
      icon: CreditCard,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 6,
      type: 'enrollment',
      student: 'نور الدين',
      email: 'nour.aldeen@email.com',
      timestamp: '2025-08-11 14:15',
      details: 'Enrolled in Arabic Calligraphy',
      course: 'Arabic Calligraphy',
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 7,
      type: 'login',
      student: 'زينب محمود',
      email: 'zeinab.mahmoud@email.com',
      timestamp: '2025-08-11 12:45',
      details: 'Logged in from tablet',
      icon: LogIn,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 8,
      type: 'payment',
      student: 'يوسف إبراهيم',
      email: 'youssef.ibrahim@email.com',
      timestamp: '2025-08-10 19:20',
      details: 'Paid $75 for Basic Arabic Course',
      amount: 75,
      icon: CreditCard,
      color: 'text-green-600 bg-green-100'
    }
  ];

  // Calculate statistics
  const totalLogins = activities.filter(a => a.type === 'login').length;
  const totalPayments = activities.filter(a => a.type === 'payment').length;
  const totalEnrollments = activities.filter(a => a.type === 'enrollment').length;
  const totalRevenue = activities
    .filter(a => a.type === 'payment')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  // Filter activities based on selected metric
  const filteredActivities = selectedMetric === 'all' 
    ? activities 
    : activities.filter(a => a.type === selectedMetric);

  // Chart data for visualization
  const chartData = [
    { name: 'Logins', value: totalLogins, color: '#3B82F6', icon: LogIn },
    { name: 'Payments', value: totalPayments, color: '#10B981', icon: CreditCard },
    { name: 'Enrollments', value: totalEnrollments, color: '#8B5CF6', icon: BookOpen },
  ];

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'login': return 'Student Login';
      case 'payment': return 'Payment Received';
      case 'enrollment': return 'Course Enrollment';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="mt-5">
        {/* Header Section */}
        <div className="mb-8">
          

          {/* Main Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logins</p>
                  <p className="text-3xl font-bold text-blue-600">{totalLogins}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">12%</span>
                    <span className="text-gray-500 ml-1">vs last week</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <LogIn className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${totalRevenue}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">8%</span>
                    <span className="text-gray-500 ml-1">vs last week</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Course Enrollments</p>
                  <p className="text-3xl font-bold text-purple-600">{totalEnrollments}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">15%</span>
                    <span className="text-gray-500 ml-1">vs last week</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-3xl font-bold text-orange-600">127</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">5%</span>
                    <span className="text-gray-500 ml-1">vs last week</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Activity Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Activity Overview</h3>
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <div className="space-y-4">
                {chartData.map((item, index) => {
                  const IconComponent = item.icon;
                  const percentage = (item.value / Math.max(...chartData.map(d => d.value))) * 100;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                        <IconComponent className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">{item.name}</span>
                          <span className="font-bold text-gray-900">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Quick Insights</h3>
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Peak Login Time</p>
                      <p className="text-sm text-gray-600">9:00 AM - 11:00 AM</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Avg. Payment</p>
                      <p className="text-sm text-gray-600">${Math.round(totalRevenue / totalPayments)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Most Popular Course</p>
                      <p className="text-sm text-gray-600">Advanced Arabic Grammar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {filteredActivities.length} activities
                </span>
              </div>
              
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="all">All Activities</option>
                  <option value="login">Logins Only</option>
                  <option value="payment">Payments Only</option>
                  <option value="enrollment">Enrollments Only</option>
                </select>
                
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Timeline */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Activity Timeline</h3>
            <p className="text-sm text-gray-600 mt-1">Real-time student activities and system events</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredActivities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${activity.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap sm:flex-nowrap justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{activity.student}</h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {getActivityTypeLabel(activity.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{activity.email}</p>
                      <p className="text-gray-800">{activity.details}</p>
                      
                      {activity.amount && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                          <DollarSign className="w-4 h-4" />
                          ${activity.amount}
                        </div>
                      )}
                      
                      {activity.course && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                          <BookOpen className="w-4 h-4" />
                          {activity.course}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Activity className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">Try adjusting your filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}