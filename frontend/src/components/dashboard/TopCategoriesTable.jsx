import React from "react";

const TopCategoriesTable = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          No category data available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Units Sold
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Revenue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              % of Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.map((cat, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                {cat.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {cat.unitsSold.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₦{cat.revenue.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {cat.percentOfTotal}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopCategoriesTable;
