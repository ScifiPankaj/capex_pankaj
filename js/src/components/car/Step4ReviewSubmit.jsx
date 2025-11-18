// src/components/car/wizard/Step4ReviewSubmit.jsx
import React from 'react';
import {
  CheckCircle, AlertCircle, Building2, FileText, DollarSign,
  TrendingUp, Calendar, Users, Package, Leaf, Info
} from 'lucide-react';

/**
 * Step 4: Review & Submit Component
 * Final review of all collected information before submission
 *
 * @param {Object} props
 * @param {Object} props.formData - Complete form data
 * @param {Function} props.onUpdateField - Callback to update declaration checkbox
 * @param {Function} props.calculateTotalCost - Callback to calculate total cost
 * @param {Object} props.errors - Validation errors
 */
const Step4ReviewSubmit = ({ formData, onUpdateField, calculateTotalCost, errors = {} }) => {
  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

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

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Get display value with fallback
   */
  const getDisplayValue = (value, fallback = 'N/A') => {
    return value || fallback;
  };

  /**
   * Get array count
   */
  const getArrayCount = (arrayField) => {
    const array = formData[arrayField] || [];
    return array.length;
  };

  // Calculate total cost
  const totalCost = calculateTotalCost();

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Review & Submit</h3>
            <p className="text-gray-600 mt-1">Please review all information carefully before submitting your request</p>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Project Name',
            value: formData.projectName || 'N/A',
            icon: FileText,
            color: 'indigo',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600'
          },
          {
            label: 'Total Cost',
            value: formatCurrency(totalCost),
            icon: DollarSign,
            color: 'emerald',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
          },
          {
            label: 'Department',
            value: formData.department || 'N/A',
            icon: Building2,
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          {
            label: 'Payback Period',
            value: formData.paybackPeriod ? `${formData.paybackPeriod} years` : 'N/A',
            icon: TrendingUp,
            color: 'purple',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
          }
        ].map((summaryCard, cardIndex) => {
          const SummaryIcon = summaryCard.icon;
          return (
            <div
              key={cardIndex}
              className="bg-white rounded-xl p-5 shadow-sm border-2 border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${summaryCard.bgColor} rounded-lg flex items-center justify-center`}>
                  <SummaryIcon className={`w-5 h-5 ${summaryCard.textColor}`} />
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {summaryCard.label}
              </p>
              <p className="text-lg font-bold text-gray-900 truncate" title={summaryCard.value}>
                {summaryCard.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Detailed Review Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Basic Information
          </h5>
          <div className="space-y-3">
            {[
              { label: 'Plant Code', value: formData.plantCode, icon: Building2 },
              // { label: 'SAP Plant Code', value: formData.sapPlantCode, icon: Building2 },
              { label: 'Department', value: formData.department, icon: Users },
              { label: 'Requester Name', value: formData.requesterName, icon: Users },
              { label: 'Budget Category', value: formData.budgetCategory, icon: DollarSign },
              { label: 'Capital Budget', value: formData.isCapitalBudget === 'yes' ? 'Yes' : formData.isCapitalBudget === 'no' ? 'No' : 'N/A', icon: CheckCircle }
            ].map((detail, detailIndex) => {
              const DetailIcon = detail.icon;
              return (
                <div
                  key={detailIndex}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <DetailIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">{detail.label}:</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">{getDisplayValue(detail.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Project Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-indigo-600" />
            Project Information
          </h5>
          <div className="space-y-3">
            {[
              { label: 'Project Name', value: formData.projectName, icon: FileText },
              { label: 'Commissioning Date', value: formatDate(formData.commissioningDate), icon: Calendar },
              {
                label: 'Part of Project',
                value:
                  formData.isPartOfProject === 'yes'
                    ? 'Yes'
                    : formData.isPartOfProject === 'no'
                      ? 'No'
                      : 'N/A',
                icon: CheckCircle
              },

              { label: 'Nature of Assets', value: `${getArrayCount('natureOfAsset')} selected`, icon: Package },
              { label: 'Requirement Types', value: `${getArrayCount('requirementType')} selected`, icon: Package },
              { label: 'Project Items', value: (formData.projectItems || []).length, icon: Package }
            ].map((detail, detailIndex) => {
              const DetailIcon = detail.icon;
              return (
                <div
                  key={detailIndex}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <DetailIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">{detail.label}:</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">{getDisplayValue(detail.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Financial Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 lg:col-span-2">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Financial Summary
          </h5>
          <div className="grid grid-cols-3 gap-6">
            {[
              {
                label: 'Total Project Cost',
                value: formatCurrency(totalCost),
                icon: DollarSign,
                highlight: true
              },
              {
                label: 'Payback Period',
                value: formData.paybackPeriod ? `${formData.paybackPeriod} years` : 'N/A',
                icon: TrendingUp
              },
              {
                label: 'Project IRR',
                value: formData.projectIRR ? `${formData.projectIRR}%` : 'N/A',
                icon: TrendingUp
              }
            ].map((metric, metricIndex) => {
              const MetricIcon = metric.icon;
              return (
                <div key={metricIndex} className={`p-4 rounded-lg ${metric.highlight ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MetricIcon className={`w-4 h-4 ${metric.highlight ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <span className="text-lg font-semibold text-gray-600 uppercase">{metric.label}</span>
                  </div>
                  <span className={`text-2xl font-bold ${metric.highlight ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {metric.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Justification */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 lg:col-span-2">
          <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-indigo-600" />
            Project Justification
          </h5>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {formData.justification || 'No justification provided'}
            </p>
          </div>
        </div>

        {/* Section 5: ESG Impact */}
        {(getArrayCount('esgImpactCategories') > 0 || formData.esgImpactDetails) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 lg:col-span-2">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-lg">
              <Leaf className="w-5 h-5 text-green-600" />
              ESG Impact Assessment
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 font-medium">ESG Categories Selected:</span>
                <span className="text-sm text-gray-900 font-semibold bg-green-100 px-3 py-1 rounded-full">
                  {getArrayCount('esgImpactCategories')} categories
                </span>
              </div>
              {formData.esgImpactDetails && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {formData.esgImpactDetails}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Declaration Section */}
      <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-300 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-amber-900 mb-3">Declaration & Confirmation</h4>
            <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${formData.declaration
                ? 'bg-amber-100 border-amber-400'
                : 'bg-white border-amber-200 hover:border-amber-300'
              }`}>
              <input
                type="checkbox"
                checked={formData.declaration || false}
                onChange={(e) => onUpdateField('declaration', e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 mt-0.5 flex-shrink-0"
              />
              <div>
                <span className="text-gray-900 font-semibold block mb-1">
                  I hereby declare and confirm:
                </span>
                <ul className="text-sm text-gray-800 space-y-1 list-disc list-inside">
                  <li>All the information provided in this CAR form is accurate and complete to the best of my knowledge</li>
                  <li>I have reviewed all financial calculations and project details</li>
                  <li>The justification provided represents genuine business requirements</li>
                  <li>I understand that false information may lead to rejection of this request</li>
                </ul>
              </div>
            </label>
            {errors.declaration && (
              <p className="mt-2 text-sm text-red-600 font-semibold">{errors.declaration}</p>
            )}
          </div>
        </div>
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">What happens next?</h4>
            <p className="text-sm text-blue-800">
              After submission, your CAR request will be routed through the approval workflow based on your
              plant and project cost. You'll receive email notifications at each approval stage. The request
              can be saved as draft and edited until final submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4ReviewSubmit;