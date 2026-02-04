import React, { memo } from "react";
import { X, AlertTriangle } from "lucide-react";

const StockIssueModal = memo(({ isOpen, onClose, stockIssues }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-issue-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={28} />
            <h2 id="stock-issue-modal-title" className="text-2xl font-bold text-red-600">
              Stock Issues
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="hover:bg-gray-100 rounded-full p-1 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">
            The following items in your cart have stock issues:
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="space-y-2">
              {stockIssues.map((issue, index) => (
                <li key={index} className="text-red-700 text-sm flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-gray-600 text-sm">
            Please update your cart before proceeding to checkout.
          </p>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold transition"
          >
            Update Cart
          </button>
        </div>
      </div>
    </div>
  );
});

StockIssueModal.displayName = "StockIssueModal";

export default StockIssueModal;
