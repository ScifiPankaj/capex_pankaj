// src/components/car/CarRequestView.jsx
import React from 'react';
import {
  X,
  Building2,
  User,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Leaf,
  AlertCircle,
  Download,
  Printer,
  Share2,
  Edit,
  ArrowLeft,
  Info,
  MapPin,
  Briefcase,
  Target,
  Award,
  ShoppingCart,
  IndianRupee
} from 'lucide-react';

// ✅ Import master data hooks to resolve IDs to names
import {
  useGetPlantsQuery,
  useGetRequirementsQuery,
  useGetNatureAssetsQuery,
  useGetItemSourcesQuery,
  useGetEsgImpactsQuery,
} from '../../reducers/features/masters/mastersApi';

/**
 * CarRequestView Component
 * Enhanced read-only comprehensive view with master data integration
 */
const CarRequestView = ({ carData, onClose, onEdit }) => {
  // ============================================================
  // FETCH MASTER DATA
  // ============================================================
  const { data: plantsData } = useGetPlantsQuery();
  const { data: requirementsData } = useGetRequirementsQuery();
  const { data: natureAssetsData } = useGetNatureAssetsQuery();
  const { data: itemSourcesData } = useGetItemSourcesQuery();
  const { data: esgImpactsData } = useGetEsgImpactsQuery();

  // Extract arrays from API responses
  const plants = plantsData?.objects || [];
  const requirements = requirementsData?.objects || [];
  const natureAssets = natureAssetsData?.objects || [];
  const itemSources = itemSourcesData?.objects || [];
  const esgImpacts = esgImpactsData?.objects || [];

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  /**
   * Format currency for display
   */
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Get status badge styling
   */
  const getStatusStyle = (status) => {
    const statusMap = {
      'Created': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: Clock,
        label: 'Draft'
      },
      'Submitted': {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
        icon: Clock,
        label: 'Pending Approval'
      },
      'Approved': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: CheckCircle,
        label: 'Approved'
      },
      'Rejected': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: XCircle,
        label: 'Rejected'
      },
    };
    return statusMap[status] || statusMap['Created'];
  };

  /**
   * Parse project items from JSON string
   */
  const getProjectItems = () => {
    try {
      if (typeof carData.project_items_json === 'string') {
        return JSON.parse(carData.project_items_json);
      }
      return carData.project_items_json || [];
    } catch {
      return [];
    }
  };

  /**
   * Calculate item total
   */
  const calculateItemTotal = (item) => {
    return (parseFloat(item.qty || 0) * parseFloat(item.net_price || 0));
  };

  /**
   * Get priority level based on cost
   */
  const getPriorityLevel = () => {
    const cost = parseFloat(carData.new_project_cost) || 0;
    if (cost > 5000000) {
      return { level: 'High Priority', color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' };
    }
    if (cost > 1000000) {
      return { level: 'Medium Priority', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡' };
    }
    return { level: 'Low Priority', color: 'text-green-600', bg: 'bg-green-50', icon: '🟢' };
  };

  /**
   * Parse comma-separated IDs to array
   */
  const parseIdArray = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    return String(field).split(',').filter(Boolean);
  };

  // ✅ NEW: Get plant name by code
  const getPlantName = (plantCode) => {
    const plant = plants.find(p => p.plant_code === plantCode);
    return plant ? plant.plant_name || plant.name : plantCode;
  };

  // ✅ NEW: Get requirement name by code
  const getRequirementName = (reqCode) => {
    const req = requirements.find(r => r.requirement_code === reqCode);
    return req ? req.requirement_name || req.name : reqCode;
  };

  // ✅ NEW: Get nature asset names by IDs
  const getNatureAssetNames = (ids) => {
    const idArray = parseIdArray(ids);
    return idArray.map(id => {
      const asset = natureAssets.find(a => a.nature_asset_id === parseInt(id));
      return asset ? asset.asset_name || asset.name : `Asset ID: ${id}`;
    });
  };

  // ✅ NEW: Get ESG impact names by IDs
  const getEsgImpactNames = (ids) => {
    const idArray = parseIdArray(ids);
    return idArray.map(id => {
      const esg = esgImpacts.find(e => e.esg_id === parseInt(id));
      return esg ? esg.name : `ESG ID: ${id}`;
    });
  };

  // ============================================================
  // DATA EXTRACTION
  // ============================================================

  const statusStyle = getStatusStyle(carData.car_status);
  const StatusIcon = statusStyle.icon;
  const projectItems = getProjectItems();
  const priority = getPriorityLevel();
  const natureAssetNames = getNatureAssetNames(carData.nature_asset_ids);
  const esgImpactNames = getEsgImpactNames(carData.esg_ids);

  // ============================================================
  // ACTION HANDLERS
  // ============================================================

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Download as PDF feature coming soon!');
  };

  const handleShare = () => {
    alert('Share feature coming soon!');
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b-2 border-gray-200 shadow-sm sticky top-0 z-10 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {carData.project_name || 'Untitled Project'}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-gray-600 font-medium">
                  CAR #{carData.car_no || 'N/A'}
                </p>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 flex items-center gap-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusStyle.label}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              title="Print"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
            {onEdit && (carData.car_status === 'Created' || !carData.car_status) && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                title="Edit Request"
              >
                <Edit className="w-5 h-5" />
                Edit Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Total Cost</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(carData.new_project_cost)}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Payback Period</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{carData.payback_period || 'N/A'} years</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Project IRR</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{carData.project_irr || 'N/A'}%</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Project Items</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{projectItems.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Basic Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Plant Code
                      </p>
                      <p className="text-lg font-bold text-gray-900">{carData.plant_code || 'N/A'}</p>
                      {/* ✅ Show plant name */}
                      <p className="text-sm text-gray-600 mt-1">{getPlantName(carData.plant_code)}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        SAP Plant Code
                      </p>
                      <p className="text-lg font-bold text-gray-900">{carData.sap_plant_code || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Department
                      </p>
                      <p className="text-lg font-bold text-gray-900">{carData.dept || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Requester Name
                      </p>
                      <p className="text-lg font-bold text-gray-900">{carData.requester_name || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2">Budget Category</p>
                      <p className="text-lg font-bold text-gray-900">{carData.budget_category || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2">Capital Budget</p>
                      <p className="text-lg font-bold text-gray-900">
                        {carData.is_capital_budget === '1' || carData.is_capital_budget === 'yes' ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Project Details
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Project Name</p>
                    <p className="text-lg font-bold text-gray-900">{carData.project_name || 'N/A'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Commissioning Date
                      </p>
                      <p className="text-base font-bold text-gray-900">{formatDate(carData.date_comm)}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2">Part of Project</p>
                      <p className="text-base font-bold text-gray-900">
                        {carData.ispart_project === 1 || carData.ispart_project === '1' ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* ✅ Show Nature of Assets with NAMES */}
                  {natureAssetNames.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Nature of Assets ({natureAssetNames.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {natureAssetNames.map((name, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ✅ Show Requirement Type with NAME */}
                  {carData.requirement_code && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Requirement Type
                      </p>
                      <span className="inline-block px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold border border-purple-200">
                        {getRequirementName(carData.requirement_code)}
                      </span>
                    </div>
                  )}

                  {carData.justification && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-3">Justification</p>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {carData.justification}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Enhanced Project Items Table */}
              {projectItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Project Items Details ({projectItems.length} items)
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {projectItems.map((item, index) => (
                        <div
                          key={index}
                          className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <span className="text-emerald-600 font-bold">{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-base font-bold text-gray-900">
                                  {item.description || 'Untitled Item'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                                    {item.type || 'N/A'}
                                  </span>
                                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-semibold">
                                    {item.condition || 'New'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 font-semibold">Item Total</p>
                              <p className="text-xl font-bold text-emerald-600">
                                {formatCurrency(calculateItemTotal(item))}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Quantity</p>
                              <p className="text-lg font-bold text-gray-900">
                                {item.qty || 0}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Unit Price</p>
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(item.net_price || 0)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 font-semibold mb-1">Line Total</p>
                              <p className="text-lg font-bold text-emerald-600">
                                {formatCurrency(calculateItemTotal(item))}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Grand Total */}
                    <div className="mt-6 pt-4 border-t-2 border-gray-300">
                      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 p-5 rounded-xl border-2 border-emerald-200">
                        <span className="text-xl font-bold text-gray-900">Grand Total:</span>
                        <span className="text-3xl font-bold text-emerald-600">
                          {formatCurrency(carData.new_project_cost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ ESG Impact with NAMES */}
              {(esgImpactNames.length > 0 || carData.esg_impact_details) && (
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Leaf className="w-5 h-5" />
                      ESG Impact Assessment
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {esgImpactNames.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          ESG Categories ({esgImpactNames.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {esgImpactNames.map((name, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {carData.esg_impact_details && (
                      <div className={esgImpactNames.length > 0 ? 'pt-4 border-t border-gray-200' : ''}>
                        <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                          <Leaf className="w-4 h-4" />
                          ESG Impact Details
                        </p>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {carData.esg_impact_details}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - 1/3 width */}
            <div className="col-span-1 space-y-6">
              {/* Status Timeline */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Request Status
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusStyle.bg}`}>
                        <StatusIcon className={`w-6 h-6 ${statusStyle.text}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Current Status</p>
                        <p className={`text-lg font-bold ${statusStyle.text}`}>
                          {statusStyle.label}
                        </p>
                      </div>
                    </div>

                    {carData.created_at && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Created On</p>
                        <p className="text-sm font-bold text-gray-900">{formatDate(carData.created_at)}</p>
                      </div>
                    )}

                    {carData.updated_at && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm font-bold text-gray-900">{formatDate(carData.updated_at)}</p>
                      </div>
                    )}

                    {carData.cdb_object_id && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Object ID</p>
                        <p className="text-xs font-mono text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 break-all">
                          {carData.cdb_object_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 shadow-lg text-white">
                <h4 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  FINANCIAL SUMMARY
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/70 mb-1">Total Project Cost</p>
                    <p className="text-3xl font-bold">{formatCurrency(carData.new_project_cost)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div>
                      <p className="text-xs text-white/70 mb-1">Payback</p>
                      <p className="text-lg font-bold">{carData.payback_period || 'N/A'}y</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 mb-1">IRR</p>
                      <p className="text-lg font-bold">{carData.project_irr || 'N/A'}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Badge */}
              <div className={`rounded-xl p-6 shadow-sm border-2 ${priority.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${priority.bg} flex items-center justify-center text-2xl border-2 ${priority.color} border-opacity-30`}>
                    {priority.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Priority Level</p>
                    <p className={`text-lg font-bold ${priority.color}`}>
                      {priority.level}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Information</p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      This is a read-only view of the CAR request. To make changes, click the "Edit Request" button above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default CarRequestView;