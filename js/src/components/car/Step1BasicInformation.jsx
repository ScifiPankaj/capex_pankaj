// src/components/car/wizard/Step1BasicInformation.jsx
import React from 'react';
import { Building2, Loader2, DollarSign, Info, AlertCircle } from 'lucide-react';
import { useGetPlantsQuery } from '../../reducers/features/masters/mastersApi';

/**
 * Step 1: Basic Information Component
 * Handles plant selection, department, requester, and budget details
 *
 * @param {Object} props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.onUpdateField - Callback to update single field
 * @param {Object} props.errors - Validation errors
 */
const Step1BasicInformation = ({ formData, onUpdateField, errors = {} }) => {
  // ============================================================
  // RTK QUERY - FETCH PLANTS DATA
  // ============================================================
  const { data: plantsResponse, isLoading: isPlantsLoading, error: plantsError } = useGetPlantsQuery();

  // Extract plants array from API response
  const plantsList = plantsResponse?.objects || [];

  // ============================================================
  // HANDLERS
  // ============================================================

  /**
   * Handle plant code selection
   */
  const handlePlantCodeChange = (selectedPlantCode) => {
    onUpdateField('plantCode', selectedPlantCode);

    // Plant object find karo
    const selectedPlant = plantsList.find(
      p => String(p.plant_code) === String(selectedPlantCode)
    );

    // SAP Plant Code form data me set karo
    onUpdateField('sapPlantCode', selectedPlant?.sap_plant_code || '');
  };


  /**
   * Handle "Is Part of Project" change
   * Reset project-related fields when switching
   */
  // Step1BasicInformation.jsx

  const handleIsPartOfProjectChange = (value) => {
    onUpdateField('isPartOfProject', value);

    if (value === 'yes') {
      // Project ka part hai → standalone wali cheeze clear
      onUpdateField('standaloneRemark', '');
      onUpdateField('newProjectCost', '');
    } else if (value === 'no') {
      // Standalone hai → project cost wali cheeze clear
      onUpdateField('originalProjectCost', '');
      onUpdateField('totalAppropriation', '');
    }
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Compact Header */}



      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="space-y-3">

          {/* Plant Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-lg font-bold text-gray-800 mb-1.5">
              Plant Name <span className="text-red-500">*</span>
            </label>
            {isPlantsLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-lg text-gray-500">Loading plants...</span>
              </div>
            ) : plantsError ? (
              <div className="px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error loading plants. Please refresh.
              </div>
            ) : (
              <>
                <select
                  value={formData.plantCode || ''}
                  onChange={(e) => handlePlantCodeChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg ${errors.plantCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                >
                  <option value="">-- Select Plant --</option>
                  {plantsList.map((plant) => (
                    <option key={plant.plant_code} value={plant.plant_code}>
                      {plant.plant_code} - {plant.plant_name || plant.name}
                    </option>
                  ))}
                </select>
                {errors.plantCode && (
                  <p className="mt-1 text-lg text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.plantCode}
                  </p>
                )}
                {formData.plantCode && (
                  <p className="mt-1 text-lg text-gray-500">
                    SAP Code:{' '}
                    <span className="font-semibold">
                      {plantsList.find(
                        p => String(p.plant_code) === String(formData.plantCode)
                      )?.plant_code || 'N/A'}
                    </span>
                  </p>
                )}


              </>
            )}
          </div>

          {/* Department & Requester - Side by Side */}
          <div className="grid grid-cols-2 gap-2">
            {/* Department */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <label className="block text-lg font-bold text-gray-800 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => onUpdateField('department', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg ${errors.department ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="e.g., Production"
              />
              {errors.department && (
                <p className="mt-1 text-lg text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.department}
                </p>
              )}
            </div>

            {/* Requester Name */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <label className="block text-lg font-bold text-gray-800 mb-1.5">
                Requester Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.requesterName || ''}
                onChange={(e) => onUpdateField('requesterName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg ${errors.requesterName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                placeholder="Enter your full name"
              />
              {errors.requesterName && (
                <p className="mt-1 text-lg text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.requesterName}
                </p>
              )}
            </div>
          </div>



          {/* Is Part of Project */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <label className="block text-lg font-bold text-gray-800 mb-1.5">
              Is this Part of a Project? <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.isPartOfProject || ''}
              onChange={(e) => handleIsPartOfProjectChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg ${errors.isPartOfProject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
            >
              <option value="">-- Select Option --</option>
              <option value="yes">Yes - Part of existing project</option>
              <option value="no">No - Standalone request</option>
            </select>
            {errors.isPartOfProject && (
              <p className="mt-1 text-lg text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.isPartOfProject}
              </p>
            )}
          </div>

          {/* Conditional: Project Cost Section */}
          {formData.isPartOfProject === 'yes' && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-300">
                <DollarSign className="w-4 h-4 text-amber-700" />
                <h4 className="text-lg font-bold text-amber-900">Project Cost Details</h4>
              </div>

              {/* Original Project Cost */}
              <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                <label className="text-lg font-semibold text-gray-800">
                  Original Project Cost <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded border border-gray-300">Rs.</span>
                  <input
                    type="number"
                    value={formData.originalProjectCost || ''}
                    onChange={(e) => onUpdateField('originalProjectCost', e.target.value)}
                    className={`flex-1 px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg ${errors.originalProjectCost ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.originalProjectCost && (
                  <div className="col-start-2">
                    <p className="text-lg text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.originalProjectCost}
                    </p>
                  </div>
                )}
              </div>

              {/* Total Appropriation */}
              <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                <label className="text-lg font-semibold text-gray-800">
                  Total Appropriation <span className="text-red-500">*</span>
                  <span className="block text-[10px] font-normal text-gray-600">(including this)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded border border-gray-300">Rs.</span>
                  <input
                    type="number"
                    value={formData.totalAppropriation || ''}
                    onChange={(e) => onUpdateField('totalAppropriation', e.target.value)}
                    className={`flex-1 px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg ${errors.totalAppropriation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.totalAppropriation && (
                  <div className="col-start-2">
                    <p className="text-lg text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.totalAppropriation}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-amber-300">
                <p className="text-[10px] text-amber-800 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  All costs in <span className="font-bold">Rupees (₹)</span> & <span className="font-bold">Million</span> format
                </p>
              </div>
            </div>
          )}


          {/* Conditional: Standalone Remark */}
          {formData.isPartOfProject === 'no' && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
              {/* New Project Cost */}
              <div className="grid grid-cols-[180px_1fr] gap-2 items-center">
                <label className="text-lg font-semibold text-gray-800">
                  New Project Cost <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-700 bg-white px-2 py-1 rounded border border-gray-300">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={formData.newProjectCost || ''}
                    onChange={(e) => onUpdateField('newProjectCost', e.target.value)}
                    className={`flex-1 px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg ${errors.newProjectCost ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.newProjectCost && (
                  <div className="col-start-2">
                    <p className="text-lg text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.newProjectCost}
                    </p>
                  </div>
                )}
              </div>

              {/* Remark / Reason */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-1.5">
                  Share Remark/Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.standaloneRemark || ''}
                  onChange={(e) => onUpdateField('standaloneRemark', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-lg ${errors.standaloneRemark ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Provide detailed reason for standalone request..."
                />
                {errors.standaloneRemark && (
                  <p className="mt-1 text-lg text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.standaloneRemark}
                  </p>
                )}
              </div>
            </div>
          )}


          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex gap-2">
              <Info className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-blue-800 space-y-0.5">
                <p className="font-semibold">Important Guidelines:</p>
                <ul className="list-disc list-inside space-y-0 ml-1">
                  <li>Select correct plant for approval workflow</li>
                  <li>All costs in Rupees (₹) & Million format</li>
                  <li>Fields with <span className="text-red-500">*</span> are mandatory</li>
                  {formData.isPartOfProject === 'yes' && (
                    <li>Formula: Original + New = Total</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Step1BasicInformation;