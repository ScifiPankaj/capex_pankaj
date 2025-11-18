// src/components/car/wizard/Step2ProjectDetails.jsx
import React from 'react';
import { FileText, Loader2, Calendar, CheckSquare, Info } from 'lucide-react';
import {
  useGetRequirementsQuery,
  useGetNatureAssetsQuery,
} from '../../reducers/features/masters/mastersApi';

/**
 * Step 2: Project Details Component
 * Handles project information, nature of assets, requirements, and justification
 *
 * @param {Object} props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.onUpdateField - Callback to update single field
 * @param {Function} props.onToggleArrayItem - Callback to toggle array items (checkboxes)
 * @param {Object} props.errors - Validation errors
 */
const Step2ProjectDetails = ({ formData, onUpdateField, onToggleArrayItem, errors = {} }) => {
  // ============================================================
  // RTK QUERY - FETCH MASTER DATA
  // ============================================================
  const {
    data: requirementsResponse,
    isLoading: isRequirementsLoading,
    error: requirementsError
  } = useGetRequirementsQuery();

  const {
    data: natureAssetsResponse,
    isLoading: isNatureAssetsLoading,
    error: natureAssetsError
  } = useGetNatureAssetsQuery();

  // Extract data arrays
  const requirementsList = requirementsResponse?.objects || [];
  const natureAssetsList = natureAssetsResponse?.objects || [];

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  /**
   * Check if an item is selected in an array
   */
  const isItemSelected = (arrayFieldName, itemId) => {
    const array = formData[arrayFieldName] || [];
    return array.includes(String(itemId));
  };

  /**
   * Get count of selected items
   */
  const getSelectedCount = (arrayFieldName) => {
    const array = formData[arrayFieldName] || [];
    return array.length;
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">


      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="space-y-3">

          {/* Project Name */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-lg font-bold text-gray-800 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.projectName || ''}
              onChange={(e) => onUpdateField('projectName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${errors.projectName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              placeholder="e.g., New CNC Machine Installation"
            />
            {errors.projectName && (
              <p className="mt-1 text-lg text-red-600">{errors.projectName}</p>
            )}
          </div>

          {/* Date of Commissioning & Is Part of Project - Side by Side */}
          <div className="grid grid-cols-2 gap-2">
            {/* Date of Commissioning */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <label className="block text-lg font-bold text-gray-800 mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />
                Date of Commissioning <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.commissioningDate || ''}
                onChange={(e) => onUpdateField('commissioningDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${errors.commissioningDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.commissioningDate && (
                <p className="mt-1 text-lg text-red-600">{errors.commissioningDate}</p>
              )}
              <p className="mt-1 text-[10px] text-gray-500">Expected operational date</p>
            </div>

            {/* Is Part of Project */}

          </div>
          {/* Capital Budget Included? */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Is this included in the capital budget for the year? <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.isCapitalBudget || ''}
              onChange={(e) => onUpdateField('isCapitalBudget', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${errors.isCapitalBudget ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
            >
              <option value="">Select...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            {errors.isCapitalBudget && (
              <p className="mt-1 text-xs text-red-600">{errors.isCapitalBudget}</p>
            )}

            <p className="mt-1 text-[10px] text-gray-500">
              As per approved annual CAPEX budget
            </p>
          </div>


          {/* Nature of Asset */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-lg font-bold text-gray-800 mb-1.5">
              <CheckSquare className="w-3 h-3 inline mr-1" />
              Nature of Asset <span className="text-red-500">*</span>
              {getSelectedCount('natureOfAsset') > 0 && (
                <span className="ml-2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {getSelectedCount('natureOfAsset')}
                </span>
              )}
            </label>

            {isNatureAssetsLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                <span className="text-lg text-gray-500">Loading...</span>
              </div>
            ) : natureAssetsError ? (
              <div className="px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-lg">
                Error loading nature of assets. Please refresh.
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-2 gap-2 p-2 border rounded-md bg-gray-50 ${errors.natureOfAsset ? 'border-red-500' : 'border-gray-300'
                  }`}>
                  {natureAssetsList.length === 0 ? (
                    <div className="col-span-2 text-center py-3 text-gray-500 text-lg">
                      No nature of assets available
                    </div>
                  ) : (
                    natureAssetsList.map((asset) => (
                      <label
                        key={asset.nature_asset_id}
                        className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer text-lg ${isItemSelected('natureOfAsset', asset.nature_asset_id)
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white hover:bg-indigo-50 border border-gray-200'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isItemSelected('natureOfAsset', asset.nature_asset_id)}
                          onChange={() => onToggleArrayItem('natureOfAsset', String(asset.nature_asset_id))}
                          className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="font-semibold truncate">
                          {asset.name || asset.asset_name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {errors.natureOfAsset && (
                  <p className="mt-1 text-lg text-red-600">{errors.natureOfAsset}</p>
                )}
              </>
            )}
          </div>

          {/* Requirement Type */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-lg font-bold text-gray-800 mb-1.5">
              <CheckSquare className="w-3 h-3 inline mr-1" />
              Requirement Type <span className="text-red-500">*</span>
              {getSelectedCount('requirementType') > 0 && (
                <span className="ml-2 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {getSelectedCount('requirementType')}
                </span>
              )}
            </label>

            {isRequirementsLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                <span className="text-lg text-gray-500">Loading...</span>
              </div>
            ) : requirementsError ? (
              <div className="px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-lg">
                Error loading requirements. Please refresh.
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-2 gap-2 p-2 border rounded-md bg-gray-50 ${errors.requirementType ? 'border-red-500' : 'border-gray-300'
                  }`}>
                  {requirementsList.length === 0 ? (
                    <div className="col-span-2 text-center py-3 text-gray-500 text-lg">
                      No requirement types available
                    </div>
                  ) : (
                    requirementsList.map((requirement) => (
                      <label
                        key={requirement.requirement_code}
                        className={`flex items-center gap-2 p-2 rounded-md transition-all cursor-pointer text-lg ${isItemSelected('requirementType', requirement.requirement_code)
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white hover:bg-indigo-50 border border-gray-200'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isItemSelected('requirementType', requirement.requirement_code)}
                          onChange={() =>
                            onToggleArrayItem('requirementType', String(requirement.requirement_code))
                          }
                          className="w-3 h-3 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="font-semibold truncate">
                          {requirement.name || requirement.requirement_name}
                        </span>
                      </label>
                    ))
                  )}

                </div>
                {errors.requirementType && (
                  <p className="mt-1 text-lg text-red-600">{errors.requirementType}</p>
                )}
              </>
            )}
          </div>

          {/* Justification */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-lg font-bold text-gray-800 mb-1.5">
              Project Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.justification || ''}
              onChange={(e) => onUpdateField('justification', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-lg ${errors.justification ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              placeholder="Provide detailed justification including:
• Business need and expected benefits
• Impact on production/operations
• Why this investment is necessary now
• Alternative solutions considered"
            />
            {errors.justification && (
              <p className="mt-1 text-lg text-red-600">{errors.justification}</p>
            )}
            <div className="mt-1 flex justify-between items-center">
              <p className="text-[10px] text-gray-500">Min 50 characters</p>
              <p className="text-[10px] text-gray-500">
                {(formData.justification || '').length} chars
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex gap-2">
              <Info className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-blue-800 space-y-0.5">
                <p className="font-semibold">Pro Tip:</p>
                <p>A comprehensive justification with quantifiable benefits helps approval. Include ROI, cost savings, or efficiency gains where possible.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Step2ProjectDetails;