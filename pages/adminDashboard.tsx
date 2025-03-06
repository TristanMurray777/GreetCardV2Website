//References: 1: Charts: https://recharts.org/en-US/api/Pie
//2: Charts: https://www.geeksforgeeks.org/create-a-pie-chart-using-recharts-in-reactjs/
//3: Charts: https://posthog.com/tutorials/recharts
//4: Recharts Tutorial: https://www.youtube.com/watch?v=FbUumRuvzYI&ab_channel=ui-code-tv
//5: This feature was developed in conjunction with ChatGPT-4o: Prompt: "Help me to create an admin dashboard that can be published. I want this dashboard to use real data from the database"


import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getUserCountReport, getSalesSummaryReport, publishReport } from "../utils/api";

//Defines the structure of the user count
interface UserCount {
  user_type: string;
  count: number;
}
//Defines the structure of the sales summary
interface SalesSummary {
  total_sales: number;
  top_products: { name: string; total_purchases: number }[];
}

export default function AdminDashboard() {
  const [userCounts, setUserCounts] = useState<UserCount[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({ total_sales: 0, top_products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedReport, setGeneratedReport] = useState("");



  //Fetches reports from the storage
  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const [userRes, salesRes] = await Promise.all([
          getUserCountReport(),
          getSalesSummaryReport(),
        ]);
  
  
        //Defines the correct type for `product`, converts it to a number and returns it. This was added in to debug an issue where piechart data was being returned as a string
        const formattedProducts = salesRes.data.top_products.map((product: { name: string; total_purchases: any }) => ({
          name: product.name,
          total_purchases: Number(product.total_purchases), 
        }));
  
        setUserCounts(userRes.data);
        setSalesSummary({
          total_sales: salesRes.data.total_sales,
          top_products: formattedProducts,
        });
      } catch (err) {
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);
  
  

  //Generates Report from fetched data
  const generateReport = () => {
    const report = `
      HyCards Sales Report 📊
      -----------------------------
      Total Sales: €${(Number(salesSummary.total_sales) || 0).toFixed(2)}

      Customer Breakdown:
      ${userCounts.map(user => `- ${user.user_type}: ${user.count} users`).join("\n")}

      Top 5 Purchased Cards:
      ${salesSummary.top_products.map(product => `- ${product.name}: ${product.total_purchases} purchases`).join("\n")}
    `;
    setGeneratedReport(report);
  };

  //Publishes Report
  const handlePublishReport = async () => {
    if (!generatedReport) {
      alert("Generate the report first!");
      return;
    }
  
    //Prepares structured JSON report
    const reportData = JSON.stringify({
      userCounts,
      salesSummary
    });
  
    await publishReport(reportData);
    alert("Report Published!");
  };

  //Defines colour scheme to be used in charts
  const colors = ["#4A90E2", "#50E3C2", "#F5A623", "#D0021B", "#9013FE"];

  
  //Card shadow for design
  const cardStyle = "bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 transition-all hover:shadow-2xl";

  //Renders UI
  return (

    <div className="min-h-screen p-6 text-white">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center tracking-tight">
          <span className="bg-clip-text text-transparent text-white">
            Admin Dashboard
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
        
        {error && (
          <div className="mt-4 bg-red-500/80 text-white p-3 rounded-lg text-center">
            {error}
          </div>
        )}
      </header>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2">
        {/* Stats overview card */}
        <div className={`${cardStyle} md:col-span-2`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-800">
              <h2 className="text-xl font-semibold mb-2">Sales Overview</h2>
              <div className="text-3xl font-bold text-indigo-700">
                €{(Number(salesSummary.total_sales) || 0).toFixed(2)}
              </div>
              <p className="text-gray-500">Total Sales</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={generateReport}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-70"
                disabled={loading}>
                Generate Report
              </button>
              
              <button
                onClick={handlePublishReport}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:opacity-70"
                disabled={!generatedReport || loading}>
                Publish Report
              </button>
            </div>
          </div>
        </div>

        {/* User distribution barchart */}
        <div className={cardStyle}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userCounts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="user_type" tick={{ fill: '#4B5563' }} />
              <YAxis tick={{ fill: '#4B5563' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} 
              />
              <Bar dataKey="count" barSize={50}>
                {userCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top product category pie chart */}
       <div className={cardStyle}>
  <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Purchased Cards</h2>

  {salesSummary.top_products.length > 0 ? ( //Ensures there is data before rendering
  
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
          {salesSummary.top_products.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ) : (
    <div className="text-gray-500 text-center">No data available for pie chart.</div>
  )}
</div>



        {/* Generated report card */}
        {generatedReport && (
          <div className={`${cardStyle} md:col-span-2`}>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Generated Report</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-gray-800 overflow-auto max-h-60 text-sm font-mono">
              {generatedReport}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}