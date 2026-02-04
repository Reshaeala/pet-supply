import React from "react";

const RevenueChart = ({ monthlyRevenue, totalRevenue }) => {
  if (!monthlyRevenue || monthlyRevenue.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          No revenue data available
        </p>
      </div>
    );
  }

  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-4">
        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-64">
          {monthlyRevenue.map((data, index) => {
            const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
            const monthName = new Date(data.month + "-01").toLocaleDateString(
              "en-US",
              { month: "short" }
            );

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gray-200 rounded-t relative"
                  style={{ height: "100%" }}
                >
                  <div
                    className="w-full bg-blue-500 rounded-t absolute bottom-0 hover:bg-blue-600 transition-all cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`₦${data.revenue.toLocaleString()}`}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                  {monthName}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total 12-Month Revenue:</span>
            <span className="font-bold text-gray-900">
              ₦{totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
