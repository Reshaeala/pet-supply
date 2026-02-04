import React from "react";

const StockTable = ({ stock, showAdminNote = false }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      {showAdminNote && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Stock levels are read-only. Contact Super
            Admin to update inventory.
          </p>
        </div>
      )}
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Animal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stock.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.animal}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={
                    item.stock === 0 ? "text-red-600 font-semibold" : ""
                  }
                >
                  {item.stock}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {item.stock === 0 ? (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                ) : item.stock < 10 ? (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                    Low Stock
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                    In Stock
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
