//References: 1: Charts: https://recharts.org/en-US/api/Pie
//2: Charts: https://www.geeksforgeeks.org/create-a-pie-chart-using-recharts-in-reactjs/
//3: Charts: https://posthog.com/tutorials/recharts

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getPublishedReport } from "../utils/api";

export default function AdvertiserDashboard() {
  const [publishedReport, setPublishedReport] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userCounts, setUserCounts] = useState<{ user_type: string; count: number }[]>([]);
  const [salesSummary, setSalesSummary] = useState<{ total_sales: number; top_products: { name: string; total_purchases: number }[] }>({
    total_sales: 0,
    top_products: [],
  });

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const response = await getPublishedReport();
        const reportData = response.data.report;
        setPublishedReport(reportData);

        // Extract data from the report (assuming JSON format is used for publishing)
        const parsedReport = JSON.parse(reportData);
        setUserCounts(parsedReport.userCounts);
        setSalesSummary(parsedReport.salesSummary);
        setError("");
      } catch (err) {
        setError("No reports published yet.");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  // Modern color palette that works well with purple background
  const colors = ["#4A90E2", "#50E3C2", "#F5A623", "#D0021B", "#9013FE"];

  
  // Card shadow for depth
  const cardStyle = "bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 transition-all hover:shadow-2xl";
  
  return (
    <div className="min-h-screen p-6 text-white">
      {/* Header section with improved styling */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-violet-300">
            Advertiser Dashboard
          </span>
        
        </h1>
        
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-white rounded-full"></div>
              <div className="h-2 w-2 bg-white rounded-full"></div>
              <div className="h-2 w-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </header>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto">
        {error ? (
          <div className={`${cardStyle} text-center p-10`}>
            <div className="text-gray-800 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">{error}</h2>
              <p className="text-gray-600">Reports will appear here once they are published by an administrator.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stats overview card */}
            <div className={`${cardStyle} md:col-span-2`}>
              <div className="flex justify-between items-center">
                <div className="text-gray-800">
                  <h2 className="text-xl font-semibold mb-2">Sales Overview</h2>
                  <div className="text-3xl font-bold text-indigo-700">
                    €{(Number(salesSummary.total_sales) || 0).toFixed(2)}
                  </div>
                  <p className="text-gray-500">Total Sales</p>
                </div>
                
                <div className="bg-indigo-100 p-4 rounded-lg">
                  <div className="text-sm font-medium text-indigo-800">Latest Report</div>
                  <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* User distribution chart */}
            <div className={cardStyle}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">User Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userCounts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="user_type" tick={{ fill: '#4B5563' }} />
                  <YAxis tick={{ fill: '#4B5563' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
                    }} 
                  />
                  <Bar dataKey="count" barSize={50}>
                    {userCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top products chart */}
            <div className={cardStyle}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Top 5 Purchased Cards</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={salesSummary.top_products} 
                    dataKey="total_purchases" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {salesSummary.top_products.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Additional insights card */}
            <div className={`${cardStyle} md:col-span-2 mt-6`}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Campaign Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
                  <h3 className="text-indigo-700 font-medium">User Growth</h3>
                  <p className="text-4xl font-bold text-gray-800 mt-2">
                    {userCounts.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm">Total registered users</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-lg">
                  <h3 className="text-amber-700 font-medium">Avg. Purchase</h3>
                  <p className="text-4xl font-bold text-gray-800 mt-2">
                    €{(salesSummary.total_sales / 
                      (salesSummary.top_products.reduce((acc, curr) => acc + curr.total_purchases, 0) || 1)
                    ).toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm">Per transaction</p>
                </div>
                
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg">
                  <h3 className="text-teal-700 font-medium">Top Product</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-2 truncate">
                    {salesSummary.top_products[0]?.name || "N/A"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {salesSummary.top_products[0]?.total_purchases || 0} purchases
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}