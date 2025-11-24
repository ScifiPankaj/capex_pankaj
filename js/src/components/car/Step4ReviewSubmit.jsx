// src/components/car/wizard/Step4ReviewSubmit.jsx
import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  Building2,
  FileText,
  DollarSign,
  Calendar,
  Users,
  Package,
  Leaf,
  Info,
  ListChecks
} from 'lucide-react';

import {
  useGetRequirementsQuery,
  useGetNatureAssetsQuery,
} from '../../reducers/features/masters/mastersApi';

/**
 * Step 4: Review & Submit Component
 * Final review of all collected information before submission
 */
const Step4ReviewSubmit = ({
  formData,
  onUpdateField,
  calculateTotalCost,
  errors = {}
  
}) => {
  // ============================================================
  // MASTER DATA (for showing names instead of IDs)
  // ============================================================
  const {
    data: requirementsResponse,
  } = useGetRequirementsQuery();

  const {
    data: natureAssetsResponse,
  } = useGetNatureAssetsQuery();

  const requirementsList = requirementsResponse?.objects || [];
  const natureAssetsList = natureAssetsResponse?.objects || [];

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const toNumber = (val) => Number(val || 0);

  const formatCurrency = (amount) => {
    const safe = toNumber(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safe);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDisplayValue = (value, fallback = 'N/A') => {
    return value !== undefined && value !== null && value !== '' ? value : fallback;
  };

  const getArrayCount = (arrayField) => {
    const arr = formData[arrayField] || [];
    return arr.length;
  };

  // ID → NAME helpers
  const getNatureAssetName = (id) => {
    const asset = natureAssetsList.find(
      (a) => String(a.nature_asset_id) === String(id)
    );
    return asset
      ? (asset.name || asset.asset_name || asset.description || id)
      : id;
  };

  const getRequirementName = (id) => {
    const req = requirementsList.find(
      (r) => String(r.requirement_code) === String(id)
    );
    return req
      ? (req.name || req.requirement_name || req.description || id)
      : id;
  };

  // ============================================================
  // DERIVED VALUES
  // ============================================================
  const itemsTotal = toNumber(calculateTotalCost());
  const projectItems = formData.projectItems || [];
  const natureAssetIds = formData.natureOfAsset || [];
  const requirementIds = formData.requirementType || [];

  // Project cost from Step-1 (depends on Part of Project)
  const projectCost =
    formData.isPartOfProject === 'yes'
      ? toNumber(formData.originalProjectCost)
      : toNumber(formData.newProjectCost);

  const remainingBudget = projectCost ? projectCost - itemsTotal : 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Review &amp; Submit</h3>
            <p className="text-gray-600 mt-1">
              Please review all information carefully before submitting your request.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Project Name',
            value: formData.projectName || 'N/A',
            icon: FileText,
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
          },
          {
            label: 'Project Cost (Step 1)',
            value: projectCost ? formatCurrency(projectCost) : 'N/A',
            icon: DollarSign,
            bg: 'bg-sky-50',
            text: 'text-sky-600',
          },
          {
            label: 'Items Cost (Step 3)',
            value: formatCurrency(itemsTotal),
            icon: DollarSign,
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
          },
          {
            label: 'Department',
            value: formData.department || 'N/A',
            icon: Users,
            bg: 'bg-slate-50',
            text: 'text-slate-700',
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 shadow-sm border-2 border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.text}`} />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {card.label}
              </p>
              <p className="text-lg font-bold text-gray-900 truncate" title={card.value}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Basic Information
          </h5>
          <div className="space-y-3">
            {[
              { label: 'Plant Code', value: formData.plantCode, icon: Building2 },
              { label: 'SAP Plant Code', value: formData.sapPlantCode, icon: Building2 },
              { label: 'Department', value: formData.department, icon: Users },
              { label: 'Requester Name', value: formData.requesterName, icon: Users },
              { label: 'Budget Category', value: formData.budgetCategory, icon: DollarSign },
              {
                label: 'Capital Budget Included',
                value:
                  formData.isCapitalBudget === 'yes'
                    ? 'Yes'
                    : formData.isCapitalBudget === 'no'
                    ? 'No'
                    : 'N/A',
                icon: CheckCircle,
              },
            ].map((row, idx) => {
              const Icon = row.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">
                      {row.label}:
                    </span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">
                    {getDisplayValue(row.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-indigo-600" />
            Project Information
          </h5>
          <div className="space-y-3">
            {[
              { label: 'Project Name', value: formData.projectName, icon: FileText },
              {
                label: 'Commissioning Date',
                value: formatDate(formData.commissioningDate),
                icon: Calendar,
              },
              {
                label: 'Is Part of Project',
                value:
                  formData.isPartOfProject === 'yes'
                    ? 'Yes - Part of existing project'
                    : formData.isPartOfProject === 'no'
                    ? 'No - Standalone request'
                    : 'N/A',
                icon: CheckCircle,
              },
              {
                label: 'Nature of Assets Selected',
                value: `${getArrayCount('natureOfAsset')} selected`,
                icon: Package,
              },
              {
                label: 'Requirement Types Selected',
                value: `${getArrayCount('requirementType')} selected`,
                icon: Package,
              },
              {
                label: 'Project Items',
                value: projectItems.length,
                icon: Package,
              },
            ].map((row, idx) => {
              const Icon = row.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-medium">
                      {row.label}:
                    </span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">
                    {getDisplayValue(row.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Summary (Project cost - Items cost) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 lg:col-span-2">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Financial Summary
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-sky-50 border border-sky-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  Project Cost (Step 1)
                </span>
              </div>
              <span className="text-xl font-bold text-sky-700">
                {projectCost ? formatCurrency(projectCost) : 'N/A'}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  Items Cost (Step 3)
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-700">
                {formatCurrency(itemsTotal)}
              </span>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                remainingBudget < 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign
                  className={`w-4 h-4 ${
                    remainingBudget < 0 ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  Remaining Budget
                </span>
              </div>
              <span
                className={`text-xl font-bold ${
                  remainingBudget < 0 ? 'text-red-700' : 'text-amber-700'
                }`}
              >
                {projectCost ? formatCurrency(remainingBudget) : 'N/A'}
              </span>
              {remainingBudget < 0 && (
                <p className="mt-1 text-xs text-red-700">
                  Items cost is exceeding the entered project cost.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Nature of Asset & Requirement Names */}
        {(natureAssetIds.length > 0 || requirementIds.length > 0) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 lg:col-span-2">
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-indigo-600" />
              Nature of Asset &amp; Requirements
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nature of Asset */}
              <div>
                <h6 className="text-sm font-semibold text-gray-800 mb-2">
                  Nature of Asset ({natureAssetIds.length})
                </h6>
                {natureAssetIds.length === 0 ? (
                  <p className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-md px-3 py-2">
                    No assets selected
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">
                            #
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">
                            Asset
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {natureAssetIds.map((id, idx) => (
                          <tr
                            key={`${id}-${idx}`}
                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-3 py-1.5 text-gray-700">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-1.5 font-semibold text-gray-900">
                              {getNatureAssetName(id)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Requirement Types */}
              <div>
                <h6 className="text-sm font-semibold text-gray-800 mb-2">
                  Requirement Types ({requirementIds.length})
                </h6>
                {requirementIds.length === 0 ? (
                  <p className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-md px-3 py-2">
                    No requirement types selected
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">
                            #
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-600">
                            Requirement
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {requirementIds.map((id, idx) => (
                          <tr
                            key={`${id}-${idx}`}
                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-3 py-1.5 text-gray-700">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-1.5 font-semibold text-gray-900">
                              {getRequirementName(id)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Project Items Table */}
        {projectItems.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 lg:col-span-2">
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <ListChecks className="w-5 h-5 text-emerald-600" />
              Project Items
            </h5>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="max-h-72 overflow-y-auto">
                  <table className="min-w-full text-xs md:text-sm">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">#</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Description
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Source
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Condition
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-600">
                          Qty
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-600">
                          Net Price (₹)
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-600">
                          Line Total (₹)
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectItems.map((item, idx) => {
                        const qty = toNumber(item.quantity);
                        const price = toNumber(item.netPrice);
                        const lineTotal = qty * price;

                        return (
                          <tr
                            key={idx}
                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-3 py-2 text-gray-700">{idx + 1}</td>
                            <td className="px-3 py-2 text-gray-900 font-semibold max-w-xs">
                              {getDisplayValue(item.description)}
                            </td>
                            <td className="px-3 py-2 text-gray-800">
                              {getDisplayValue(item.sourceId, '—')}
                            </td>
                            <td className="px-3 py-2 text-gray-800">
                              {getDisplayValue(item.isNew || 'New')}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {getDisplayValue(item.quantity, 0)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {item.netPrice ? formatCurrency(item.netPrice) : 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-right text-emerald-700 font-semibold">
                              {lineTotal ? formatCurrency(lineTotal) : '—'}
                            </td>
                            <td className="px-3 py-2 text-gray-800 max-w-xs">
                              {getDisplayValue(item.remarks, '-')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td
                          className="px-3 py-2 text-right font-semibold text-gray-700"
                          colSpan={6}
                        >
                          Total
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-700">
                          {formatCurrency(itemsTotal)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Justification */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 lg:col-span-2">
          <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-indigo-600" />
            Project Justification
          </h5>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-3">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {formData.justification || 'No justification provided'}
            </p>
          </div>

          {formData.isPartOfProject === 'no' && formData.standaloneRemark && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-xs font-semibold text-amber-800 mb-1">
                Standalone Request Remark
              </p>
              <p className="text-sm text-amber-900 whitespace-pre-wrap">
                {formData.standaloneRemark}
              </p>
            </div>
          )}
        </div>

        {/* ESG Impact */}
        {(getArrayCount('esgImpactCategories') > 0 || formData.esgImpactDetails) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 lg:col-span-2">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-lg">
              <Leaf className="w-5 h-5 text-green-600" />
              ESG Impact Assessment
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 font-medium">
                  ESG Categories Selected:
                </span>
                <span className="text-sm text-gray-900 font-semibold bg-green-100 px-3 py-1 rounded-full">
                  {getArrayCount('esgImpactCategories')} categories
                </span>
              </div>

              {Array.isArray(formData.esgImpactCategories) &&
                formData.esgImpactCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.esgImpactCategories.map((id) => (
                      <span
                        key={id}
                        className="text-xs bg-green-50 border border-green-200 text-green-800 px-2 py-0.5 rounded-full"
                      >
                        ESG ID: {id}
                      </span>
                    ))}
                  </div>
                )}

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

      {/* Declaration */}
      <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-300 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-amber-900 mb-3">
              Declaration &amp; Confirmation
            </h4>
            <label
              className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                formData.declaration
                  ? 'bg-amber-100 border-amber-400'
                  : 'bg-white border-amber-200 hover:border-amber-300'
              }`}
            >
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
                  <li>
                    All the information provided in this CAR form is accurate and
                    complete to the best of my knowledge.
                  </li>
                  <li>I have reviewed all financial calculations and project details.</li>
                  <li>The justification provided represents genuine business requirements.</li>
                  <li>
                    I understand that false information may lead to rejection of this
                    request.
                  </li>
                </ul>
              </div>
            </label>
            {errors.declaration && (
              <p className="mt-2 text-sm text-red-600 font-semibold">
                {errors.declaration}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              What happens next?
            </h4>
            <p className="text-sm text-blue-800">
              After submission, your CAR request will be routed through the approval
              workflow based on your plant and project cost. You&apos;ll receive
              notifications at each approval stage. The request can be saved as draft
              and edited until final submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4ReviewSubmit;
