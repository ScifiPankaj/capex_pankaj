// src/components/car/CarRequestView.jsx
import React from 'react';
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Share2,
  Building2,
  Calendar,
  FileText,
  Package,
  Leaf,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  ShoppingCart,
} from 'lucide-react';

import {
  useGetPlantsQuery,
  useGetRequirementsQuery,
  useGetNatureAssetsQuery,
  useGetItemSourcesQuery,
  useGetEsgImpactsQuery,
} from '../../reducers/features/masters/mastersApi';

import { useGetCarItemsQuery } from '../../reducers/features/CarForm/carRequestApi';

const CarRequestView = ({ carData, onClose, onEdit }) => {
  // ---------- MASTER DATA ----------
  const { data: plantsData } = useGetPlantsQuery();
  const { data: requirementsData } = useGetRequirementsQuery();
  const { data: natureAssetsData } = useGetNatureAssetsQuery();
  const { data: itemSourcesData } = useGetItemSourcesQuery();
  const { data: esgImpactsData } = useGetEsgImpactsQuery();

  // CAR ITEMS (car_item_type table)
  const { data: allCarItemsData, isLoading: itemsLoading } = useGetCarItemsQuery();

  const plants = plantsData?.objects || [];
  const requirements = requirementsData?.objects || [];
  const natureAssets = natureAssetsData?.objects || [];
  const itemSources = itemSourcesData?.objects || [];
  const esgImpacts = esgImpactsData?.objects || [];
  const allCarItems = allCarItemsData || [];

  // ---------- HELPERS ----------
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const parseIds = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    return String(val)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  };

  const getPlantName = (plantCode) => {
    const p = plants.find((pl) => String(pl.plant_code) === String(plantCode));
    return p ? p.plant_name || p.name : plantCode || 'N/A';
  };

  const getRequirementNames = (codes) => {
    const arr = parseIds(codes);
    return arr.map((code) => {
      const r = requirements.find((rq) => String(rq.requirement_code) === String(code));
      return r ? r.requirement_name || r.name : `Req ${code}`;
    });
  };

  const getNatureAssetNames = (ids) => {
    const arr = parseIds(ids);
    return arr.map((id) => {
      const na = natureAssets.find((a) => String(a.nature_asset_id) === String(id));
      return na ? na.asset_name || na.name : `Asset ${id}`;
    });
  };

  const getEsgImpactNames = (ids) => {
    const arr = parseIds(ids);
    return arr.map((id) => {
      const e = esgImpacts.find((x) => String(x.esg_id) === String(id));
      return e ? e.name : `ESG ${id}`;
    });
  };

  const getSourceName = (sourceId) => {
    if (!sourceId && sourceId !== 0) return 'N/A';
    const s = itemSources.find((src) => String(src.source_id) === String(sourceId));
    return s ? s.source_name || s.name : `Source ${sourceId}`;
  };

  const getStatusInfo = (status) => {
    const s = status || 'Created';
    const map = {
      Created: {
        label: 'Draft',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        Icon: Clock,
      },
      Submitted: {
        label: 'Pending',
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
        Icon: Clock,
      },
      Approved: {
        label: 'Approved',
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        Icon: CheckCircle,
      },
      Rejected: {
        label: 'Rejected',
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        Icon: XCircle,
      },
    };
    return map[s] || map.Created;
  };

  // ---------- ITEMS: from car_item_type, fallback to JSON ----------
  const normalizeItems = () => {
    const carNoInt = parseInt(carData.car_no, 10);
    let linked = [];

    if (!Number.isNaN(carNoInt)) {
      linked = allCarItems.filter((it) => {
        const itemCarNo = parseInt(it.car_no, 10);
        return !Number.isNaN(itemCarNo) && itemCarNo === carNoInt;
      });
    }

    if (linked.length > 0) {
      return linked.map((it) => {
        const qty = it.qty ?? it.quantity ?? 0;
        const price = it.net_price ?? it.netPrice ?? 0;
        const cond =
          typeof it.is_new !== 'undefined'
            ? it.is_new === 1
              ? 'New'
              : 'Second Hand'
            : it.condition || 'New';
        const srcId = it.source_id ?? it.sourceId ?? null;

        return {
          description: it.description_text || it.description || '',
          quantity: qty,
          netPrice: price,
          condition: cond,
          remarks: it.remarks || '',
          sourceId: srcId,
          sourceName: getSourceName(srcId),
        };
      });
    }

    // fallback: project_items_json
    try {
      if (typeof carData.project_items_json === 'string') {
        const raw = JSON.parse(carData.project_items_json) || [];
        return raw.map((it) => {
          const qty = it.qty ?? it.quantity ?? 0;
          const price = it.net_price ?? it.netPrice ?? 0;
          const cond = it.isNew || it.condition || 'New';
          const srcId = it.source_id ?? it.sourceId ?? null;

          return {
            description: it.description || it.description_text || '',
            quantity: qty,
            netPrice: price,
            condition: cond,
            remarks: it.remarks || '',
            sourceId: srcId,
            sourceName: getSourceName(srcId),
          };
        });
      }
    } catch (e) {
      console.error('Error parsing project_items_json', e);
    }

    return [];
  };

  const projectItems = normalizeItems();
  const itemsTotal = projectItems.reduce(
    (sum, it) => sum + (parseFloat(it.quantity || 0) * parseFloat(it.netPrice || 0)),
    0
  );

  const statusInfo = getStatusInfo(carData.car_status);
  const { Icon: StatusIcon } = statusInfo;

  const natureNames = getNatureAssetNames(carData.nature_asset_ids);
  const requirementNames = getRequirementNames(carData.requirement_code);
  const esgNames = getEsgImpactNames(carData.esg_ids);

  const handlePrint = () => window.print();
  const handleDownload = () => alert('Download as PDF – TODO');
  const handleShare = () => alert('Share – TODO');

  // ---------- RENDER ----------
  return (
    <div className="h-full max-h-[90vh] flex flex-col bg-slate-50 overflow-y-auto text-base">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Close"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {carData.project_name || 'Untitled Project'}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
            <p className="text-base text-gray-600 mt-1">
              CAR #{carData.car_no || 'N/A'} · {getPlantName(carData.plant_code)} ·{' '}
              {carData.dept || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Print"
          >
            <Printer className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Download"
          >
            <Download className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
          {onEdit && (carData.car_status === 'Created' || !carData.car_status) && (
            <button
              onClick={onEdit}
              className="ml-1 px-4 py-2 rounded-md bg-indigo-600 text-white text-base font-semibold hover:bg-indigo-700"
            >
              <Edit className="w-4 h-4 inline-block mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* MAIN SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* SUMMARY ROW */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border px-4 py-3">
              <p className="text-base font-semibold text-gray-600 mb-1 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Total Cost
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(carData.new_project_cost || itemsTotal)}
              </p>
            </div>
            <div className="bg-white rounded-lg border px-4 py-3">
              <p className="text-base font-semibold text-gray-600 mb-1">
                Payback (Years)
              </p>
              <p className="text-xl font-bold text-gray-900">
                {carData.payback_period || 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-lg border px-4 py-3">
              <p className="text-base font-semibold text-gray-600 mb-1">
                Project IRR (%)
              </p>
              <p className="text-xl font-bold text-gray-900">
                {carData.project_irr || 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-lg border px-4 py-3">
              <p className="text-base font-semibold text-gray-600 mb-1 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Items
              </p>
              <p className="text-xl font-bold text-gray-900">
                {itemsLoading ? '...' : projectItems.length}
              </p>
            </div>
          </div>

          {/* PROJECT ITEMS */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-emerald-600 to-green-600">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Project Items</h3>
              </div>
              <div className="text-base text-emerald-50">
                Total:{' '}
                <span className="font-bold text-white">
                  {formatCurrency(itemsTotal)}
                </span>
              </div>
            </div>

            {itemsLoading ? (
              <div className="p-4 text-base text-gray-500">Loading items...</div>
            ) : projectItems.length === 0 ? (
              <div className="p-4 text-base text-gray-500">
                No items found for this CAR.
              </div>
            ) : (
              <div className="max-h-72 overflow-auto">
                <table className="w-full text-base">
                  <thead className="bg-slate-100 text-base text-gray-700 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold w-10">#</th>
                      <th className="px-4 py-2 text-left font-semibold">Description</th>
                      <th className="px-4 py-2 text-left font-semibold">Source</th>
                      <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">
                        Condition
                      </th>
                      <th className="px-4 py-2 text-right font-semibold">Qty</th>
                      <th className="px-4 py-2 text-right font-semibold whitespace-nowrap">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 text-right font-semibold whitespace-nowrap">
                        Line Total
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {projectItems.map((item, idx) => {
                      const lineTotal =
                        (parseFloat(item.quantity || 0) || 0) *
                        (parseFloat(item.netPrice || 0) || 0);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-gray-700">{idx + 1}</td>
                          <td className="px-4 py-2 text-gray-900 font-medium">
                            {item.description || '-'}
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            {item.sourceName}
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            {item.condition}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-900">
                            {item.quantity || 0}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-900">
                            {formatCurrency(item.netPrice || 0)}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-emerald-700">
                            {formatCurrency(lineTotal)}
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            {item.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-3 gap-4">
            {/* LEFT: Basic + Project + ESG */}
            <div className="col-span-2 space-y-4">
              {/* Basic Info */}
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">
                    Basic Information
                  </h3>
                </div>

                <div className="px-4 py-4 grid grid-cols-2 gap-4 text-base">
                  <div>
                    <p className="text-base text-gray-600">Plant</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {carData.plant_code || 'N/A'} · {getPlantName(carData.plant_code)}
                    </p>
                  </div>
                  <div>
                    <p className="text-base text-gray-600">Department</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {carData.dept || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-base text-gray-600">Requester</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {carData.requester_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-base text-gray-600">Commissioning Date</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatDate(carData.date_comm)}
                    </p>
                  </div>
                  <div>
                    <p className="text-base text-gray-600">Budget Category</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {carData.budget_category || 'CAPEX'}
                    </p>
                  </div>
                  <div>
                    <p className="text-base text-gray-600">Capital Budget</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {carData.is_capital_budget === '1' ||
                      carData.is_capital_budget === 1
                        ? 'Yes'
                        : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">
                    Project Details
                  </h3>
                </div>

                <div className="px-4 py-4 space-y-3 text-base">
                  <div>
                    <p className="text-base text-gray-600">Project Name</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {carData.project_name || 'N/A'}
                    </p>
                  </div>

                  {natureNames.length > 0 && (
                    <div>
                      <p className="text-base text-gray-600 mb-1 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Nature of Assets
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {natureNames.map((n, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-base font-semibold"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {requirementNames.length > 0 && (
                    <div>
                      <p className="text-base text-gray-600 mb-1">Requirement Type</p>
                      <div className="flex flex-wrap gap-2">
                        {requirementNames.map((n, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-base font-semibold"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {carData.justification && (
                    <div>
                      <p className="text-base text-gray-600 mb-1">Justification</p>
                      <div className="bg-slate-50 border rounded-md px-3 py-2 text-base text-gray-800 whitespace-pre-wrap">
                        {carData.justification}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ESG */}
              {(esgNames.length > 0 || carData.esg_impact_details) && (
                <div className="bg-white rounded-xl border shadow-sm">
                  <div className="px-4 py-3 border-b bg-gradient-to-r from-green-600 to-emerald-600 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">ESG Impact</h3>
                  </div>

                  <div className="px-4 py-4 space-y-3 text-base">
                    {esgNames.length > 0 && (
                      <div>
                        <p className="text-base text-gray-600 mb-1">Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {esgNames.map((n, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-base font-semibold"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {carData.esg_impact_details && (
                      <div>
                        <p className="text-base text-gray-600 mb-1">Details</p>
                        <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 text-base text-gray-800 whitespace-pre-wrap">
                          {carData.esg_impact_details}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Cost + Status */}
            <div className="col-span-1 space-y-4">
              {/* Cost Structure */}
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">
                    Cost Structure
                  </h3>
                </div>

                <div className="px-4 py-4 space-y-2 text-base">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-600">
                      Part of Existing Project
                    </span>
                    <span className="font-semibold text-gray-900">
                      {carData.ispart_project === 1 ||
                      carData.ispart_project === '1'
                        ? 'Yes'
                        : 'No'}
                    </span>
                  </div>
                  {carData.ispart_project === 1 || carData.ispart_project === '1' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-base text-gray-600">
                          Original Project Cost
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(carData.original_project_cost || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base text-gray-600">
                          Total Appropriation
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(carData.total_appropriation_cost || 0)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-base text-gray-600">
                          New Project Cost
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(carData.new_project_cost || itemsTotal)}
                        </span>
                      </div>
                      {carData.standalone_remark && (
                        <div className="mt-2">
                          <p className="text-base text-gray-600 mb-1">
                            Standalone Remark
                          </p>
                          <div className="bg-slate-50 border rounded-md px-3 py-2 text-base text-gray-800 whitespace-pre-wrap">
                            {carData.standalone_remark}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Status / Meta */}
              <div className="bg-white rounded-xl border shadow-sm">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-pink-600 to-rose-600 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Status</h3>
                </div>

                <div className="px-4 py-4 space-y-3 text-base">
                  {carData.created_at && (
                    <div>
                      <p className="text-base text-gray-600 mb-1">Created On</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(carData.created_at)}
                      </p>
                    </div>
                  )}
                  {carData.updated_at && (
                    <div>
                      <p className="text-base text-gray-600 mb-1">Last Updated</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(carData.updated_at)}
                      </p>
                    </div>
                  )}
                  {carData.cdb_object_id && (
                    <div>
                      <p className="text-base text-gray-600 mb-1">Object ID</p>
                      <p className="text-xs font-mono text-gray-700 bg-slate-50 border rounded px-2 py-1 break-all">
                        {carData.cdb_object_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-base text-blue-900 flex gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>
                  This is a read-only view of the CAR request. Use the{' '}
                  <span className="font-semibold">Edit</span> button in the header to
                  modify details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default CarRequestView;
