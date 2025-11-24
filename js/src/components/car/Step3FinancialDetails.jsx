// src/components/car/wizard/Step3FinancialDetails.jsx
import React from 'react';
import { DollarSign, Loader2, X, Plus, TrendingUp, Leaf, Info, AlertCircle } from 'lucide-react';
import {
  useGetItemSourcesQuery,
  useGetEsgImpactsQuery,
} from '../../reducers/features/masters/mastersApi';

/**
 * Step 3: Financial Details Component
 * Handles project items, costs, payback period, IRR, and ESG impacts
 *
 * @param {Object} props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.onUpdateField - Callback to update single field
 * @param {Function} props.onAddProjectItem - Callback to add new project item
 * @param {Function} props.onUpdateProjectItem - Callback to update project item
 * @param {Function} props.onRemoveProjectItem - Callback to remove project item
 * @param {Function} props.onToggleArrayItem - Callback to toggle array items
 * @param {Function} props.calculateTotalCost - Callback to calculate total project cost
 * @param {Object} props.errors - Validation errors
 */
const Step3FinancialDetails = ({
  formData,
  onUpdateField,
  onAddProjectItem,
  onUpdateProjectItem,
  onRemoveProjectItem,
  onToggleArrayItem,
  calculateTotalCost,
  errors = {}
}) => {
  // ============================================================
  // RTK QUERY - FETCH MASTER DATA
  // ============================================================
  const {
    data: itemSourcesResponse,
    isLoading: isItemSourcesLoading,
    error: itemSourcesError
  } = useGetItemSourcesQuery();

  const {
    data: esgImpactsResponse,
    isLoading: isEsgImpactsLoading,
    error: esgImpactsError
  } = useGetEsgImpactsQuery();

  // Extract data arrays
  const itemSourcesList = itemSourcesResponse?.objects || [];
  const esgImpactsList = esgImpactsResponse?.objects || [];

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  /**
   * Check if an ESG impact is selected
   */
  const isEsgImpactSelected = (esgId) => {
    const array = formData.esgImpactCategories || [];
    return array.includes(String(esgId));
  };

  /**
   * Get count of selected ESG impacts
   */
  const getSelectedEsgCount = () => {
    const array = formData.esgImpactCategories || [];
    return array.length;
  };

  /**
   * Calculate item total
   */
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const netPrice = parseFloat(item.netPrice) || 0;
    return quantity * netPrice;
  };

  /**
   * Format currency for display
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get total cost
  const totalCost = calculateTotalCost();

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">


      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="space-y-3">

          {/* Project Items Section */}
          {/* Project Items Section */}
          <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Project Items</h4>
                <p className="text-[10px] text-gray-600">Add all required items</p>
              </div>
              <button
                onClick={onAddProjectItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-lg font-bold shadow-sm"
              >
                <Plus className="w-3 h-3" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {(formData.projectItems || []).map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="p-2 border border-gray-200 rounded-md bg-gray-50"
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Item #{itemIndex + 1}
                    </span>
                    {(formData.projectItems || []).length > 1 && (
                      <button
                        onClick={() => onRemoveProjectItem(itemIndex)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0.5 rounded transition-colors"
                        title="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Fields grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Description */}
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) =>
                          onUpdateProjectItem(itemIndex, 'description', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                        placeholder="Item description"
                      />
                    </div>

                    {/* Source */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Source <span className="text-red-500">*</span>
                      </label>
                      {isItemSourcesLoading ? (
                        <div className="flex items-center gap-1 px-2 py-1.5 border border-gray-300 rounded-md bg-white text-[10px]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                      ) : (
                        <select
                          value={item.sourceId || ''}
                          onChange={(e) =>
                            onUpdateProjectItem(itemIndex, 'sourceId', e.target.value)
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                        >
                          <option value="">-- Select --</option>
                          {itemSourcesList.length === 0 ? (
                            <>
                              <option value="1">Local</option>
                              <option value="2">Import</option>
                            </>
                          ) : (
                            itemSourcesList.map((source) => (
                              <option key={source.source_id} value={source.source_id}>
                                {source.source_name || source.name}
                              </option>
                            ))
                          )}
                        </select>
                      )}
                    </div>

                    {/* Condition (New / Second Hand) */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Condition
                      </label>
                      <select
                        value={item.isNew || 'New'}
                        onChange={(e) =>
                          onUpdateProjectItem(itemIndex, 'isNew', e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                      >
                        <option value="New">New</option>
                        <option value="Second Hand">Second Hand</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Qty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.quantity || 0}
                        onChange={(e) =>
                          onUpdateProjectItem(itemIndex, 'quantity', e.target.value)
                        }
                        min="1"
                        step="1"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                      />
                    </div>

                    {/* Net Price */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">
                        Net Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.netPrice || 0}
                        onChange={(e) =>
                          onUpdateProjectItem(itemIndex, 'netPrice', e.target.value)
                        }
                        min="0"
                        step="0.01"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="mt-2">
                    <label className="block text-[10px] font-bold text-gray-700 mb-1">
                      Remarks
                    </label>
                    <input
                      type="text"
                      value={item.remarks || ''}
                      onChange={(e) =>
                        onUpdateProjectItem(itemIndex, 'remarks', e.target.value)
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                      placeholder="Any additional details"
                    />
                  </div>

                  {/* Item Total */}
                  <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between items-center">
                    <span className="text-[10px] text-gray-600 font-semibold">
                      Item Total:
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      {/* simple total here, ya tumhare calculateItemTotal se call bhi kar sakti ho */}
                      {(() => {
                        const qty = Number(item.quantity) || 0;
                        const price = Number(item.netPrice) || 0;
                        return `₹${(qty * price).toLocaleString('en-IN')}`;
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Financial Metrics */}
          <div className="grid grid-cols-2 gap-2">
            {/* Payback Period */}
            {/* <div className="bg-white border border-gray-200 rounded-lg p-3">
              <label className="block text-lg font-bold text-gray-800 mb-1.5">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Payback Period (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.paybackPeriod || ''}
                onChange={(e) => onUpdateField('paybackPeriod', e.target.value)}
                step="0.1"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.paybackPeriod ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="e.g., 3.5"
              />
              {errors.paybackPeriod && (
                <p className="mt-1 text-lg text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.paybackPeriod}
                </p>
              )}
              <p className="mt-1 text-[10px] text-gray-500">Investment recovery time</p>
            </div> */}

            {/* Project IRR
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <label className="block text-lg font-bold text-gray-800 mb-1.5">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Project IRR (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.projectIRR || ''}
                onChange={(e) => onUpdateField('projectIRR', e.target.value)}
                step="0.1"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${errors.projectIRR ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="e.g., 15.5"
              />
              {errors.projectIRR && (
                <p className="mt-1 text-lg text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.projectIRR}
                </p>
              )}
              <p className="mt-1 text-[10px] text-gray-500">Expected profitability rate</p>
            </div> */}
          </div>

          {/* ESG Impact Section */}
          <div className="bg-white border-2 border-green-200 rounded-lg p-3">
            <div className="mb-2">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-green-600" />
                ESG Impact Assessment
              </h4>
              <p className="text-[10px] text-gray-600 mt-0.5">Select applicable ESG categories</p>
            </div>

            {/* ESG Impact Categories */}
            <div className="mb-2">
              <label className="block text-lg font-bold text-gray-800 mb-1.5">
                ESG Categories
                {getSelectedEsgCount() > 0 && (
                  <span className="ml-2 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {getSelectedEsgCount()}
                  </span>
                )}
              </label>

              {isEsgImpactsLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <Loader2 className="w-3 h-3 animate-spin text-green-600" />
                  <span className="text-lg text-gray-500">Loading...</span>
                </div>
              ) : esgImpactsError ? (
                <div className="px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-lg">
                  Error loading ESG categories
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2 border border-gray-300 rounded-md bg-gray-50">
                  {esgImpactsList.length === 0 ? (
                    <div className="col-span-2 text-center py-3 text-gray-500 text-lg">
                      No ESG categories available
                    </div>
                  ) : (
                    esgImpactsList.map((esgImpact) => (
                      <label
                        key={esgImpact.esg_id}
                        className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer text-lg ${isEsgImpactSelected(esgImpact.esg_id)
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-white hover:bg-green-50 border border-gray-200'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isEsgImpactSelected(esgImpact.esg_id)}
                          onChange={() => onToggleArrayItem('esgImpactCategories', String(esgImpact.esg_id))}
                          className="w-3 h-3 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="font-semibold truncate">{esgImpact.name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ESG Impact Details */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-1.5">
                ESG Impact Details
              </label>
              <textarea
                value={formData.esgImpactDetails || ''}
                onChange={(e) => onUpdateField('esgImpactDetails', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-lg"
                placeholder="Describe environmental, social, and governance impacts:
   • Environmental benefits (energy efficiency, waste reduction)
• Social benefits (safety, community impact)
• Governance improvements (compliance, transparency)"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                Detail ESG contributions and sustainability goals
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex gap-2">
              <Info className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-blue-800 space-y-0.5">
                <p className="font-semibold">Financial Metrics Tip:</p>
                <p>Lower payback period and higher IRR indicate better ROI. Ensure accurate data for approval decisions.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Step3FinancialDetails;