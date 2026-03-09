// src/components/car/CarRequestView.jsx
import React, { useState } from 'react';
import {
  Search, Plus, FileText, CheckCircle, Clock,
  XCircle, Bell, User, Download, Edit, Trash2,
  BarChart3, Calendar, MoreVertical, DollarSign,
  RefreshCw, Eye, Star,
} from 'lucide-react';

import {
  useGetCarRequestsQuery,
  useUpdateCarRequestMutation,
  useDeleteCarRequestMutation,
} from '../../reducers/features/CarForm/carRequestApi';

import CarRequestForm from './CarRequestForm';
// import CarRequestDetail from './CarRequestDetail';


const CarRequestView = () => {
  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [modalOpen, setModalOpen]           = useState(false);
  const [editing, setEditing]               = useState(null);
  const [modalMode, setModalMode]           = useState('create'); // 'create' | 'edit' | 'view'
  const [pinnedIds, setPinnedIds]           = useState([]);

  // ── RTK Query ──────────────────────────────────────────────
  const { data: apiData, isLoading, error, refetch } = useGetCarRequestsQuery();
  const [updateCarRequest, { isLoading: isUpdating }] = useUpdateCarRequestMutation();
  const [deleteCarRequest, { isLoading: isDeleting }] = useDeleteCarRequestMutation();

  const requests = apiData?.objects || [];

  // ── Stats ──────────────────────────────────────────────────
  const stats = {
    total:      requests.length,
    pending:    requests.filter(r => r.car_status === 'Created' || r.car_status === 'Submitted' || !r.car_status).length,
    approved:   requests.filter(r => r.car_status === 'Approved').length,
    rejected:   requests.filter(r => r.car_status === 'Rejected').length,
    totalValue: requests.reduce((sum, r) => sum + (parseFloat(r.new_project_cost) || 0), 0),
  };

  const getPriorityLevel = (cost) => {
    const n = parseFloat(cost) || 0;
    if (n > 5000000) return 'high';
    if (n > 1000000) return 'medium';
    return 'low';
  };

  const priorityStats = requests.reduce(
    (acc, r) => { acc[getPriorityLevel(r.new_project_cost)] += 1; return acc; },
    { high: 0, medium: 0, low: 0 }
  );

  // ── Formatters ─────────────────────────────────────────────
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000)   return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000)     return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num.toFixed(0)}`;
  };

  const getStatusInfo = (request) => {
    const map = {
      Created:   { color: 'bg-blue-100 text-blue-800 border-blue-300',      label: 'Draft'    },
      Submitted: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Pending'  },
      Approved:  { color: 'bg-green-100 text-green-800 border-green-300',    label: 'Approved' },
      Rejected:  { color: 'bg-red-100 text-red-800 border-red-300',          label: 'Rejected' },
    };
    return map[request.car_status || 'Created'] || map.Created;
  };

  const getPriorityFromCost = (cost) => {
    const n = parseFloat(cost) || 0;
    if (n > 5000000) return { level: 'high',   color: 'bg-red-500'    };
    if (n > 1000000) return { level: 'medium', color: 'bg-yellow-500' };
    return             { level: 'low',    color: 'bg-green-500'  };
  };

  const isOverdue = (request) => {
    const status = (request.car_status || 'Created').toLowerCase();
    if (status !== 'submitted') return false;
    if (!request.date_comm) return false;
    const diffDays = (new Date() - new Date(request.date_comm)) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };

  const togglePin = (id) =>
    setPinnedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ── Filtering & Sorting ────────────────────────────────────
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      (r.project_name   || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.car_no         || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.requester_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.dept           || '').toLowerCase().includes(searchTerm.toLowerCase());

    const status = (r.car_status || 'Created').toLowerCase();
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'draft'   && status === 'created') ||
      (statusFilter === 'pending' && (status === 'submitted' || !r.car_status)) ||
      status === statusFilter;

    const matchesPriority =
      priorityFilter === 'all' || getPriorityLevel(r.new_project_cost) === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const parseDateSafe = (d) => { const ts = new Date(d).getTime(); return Number.isNaN(ts) ? 0 : ts; };
  const parseNumSafe  = (v) => { const n  = parseFloat(v);         return Number.isNaN(n)  ? 0 : n;  };

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aS = parseDateSafe(a.submitted_on), bS = parseDateSafe(b.submitted_on);
    if (aS > 0 && bS === 0) return -1;
    if (aS === 0 && bS > 0) return 1;
    if (aS > 0  && bS > 0  && aS !== bS) return bS - aS;
    const aC = parseDateSafe(a.date_comm), bC = parseDateSafe(b.date_comm);
    if (aC !== bC) return bC - aC;
    return parseNumSafe(b.car_no) - parseNumSafe(a.car_no);
  });

  const finalRequests = [...sortedRequests].sort((a, b) => {
    const aP = pinnedIds.includes(a.cdb_object_id);
    const bP = pinnedIds.includes(b.cdb_object_id);
    if (aP && !bP) return -1;
    if (!aP && bP) return 1;
    return 0;
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleSave = () => {
    setModalOpen(false);
    setEditing(null);
    setModalMode('create');
    refetch();
  };

  const handleDelete = async (request) => {
    if (!window.confirm(`Are you sure you want to delete "${request.project_name}"?`)) return;
    try {
      await deleteCarRequest(request.cdb_object_id).unwrap();
      alert('✅ Request deleted successfully!');
      refetch();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('❌ Failed to delete request');
    }
  };

  const openAdd      = ()        => { setEditing(null);    setModalMode('create'); setModalOpen(true); };
  const openEdit     = (request) => { setEditing(request); setModalMode('edit');   setModalOpen(true); };
  const openView     = (request) => { setEditing(request); setModalMode('view');   setModalOpen(true); };
  const switchToEdit = ()        => setModalMode('edit');
  const closeModal   = ()        => { setModalOpen(false); setEditing(null); setModalMode('create'); };
  const exportToExcel = ()       => alert('Export feature coming soon!');

  // ── Priority percentages ───────────────────────────────────
  const highPct = stats.total > 0 ? Math.round((priorityStats.high   / stats.total) * 100) : 0;
  const medPct  = stats.total > 0 ? Math.round((priorityStats.medium / stats.total) * 100) : 0;
  const lowPct  = stats.total > 0 ? Math.round((priorityStats.low    / stats.total) * 100) : 0;

  // ── Error screen ───────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-700 mb-4 font-medium">
            Failed to connect to API: {error?.error || error?.status || 'Unknown error'}
          </p>
          <button onClick={refetch}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all font-semibold">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="w-full h-full">

      {/* ── Header ── */}
      <div className="bg-white border-b-2 border-gray-200 mb-6">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div />
            <div className="flex items-center gap-4">
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-all relative">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button onClick={openAdd}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-semibold">
                <Plus className="w-5 h-5" />
                New Request
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project name, CAR no, requester, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-gray-900"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-gray-900 bg-white">
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-gray-900 bg-white">
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-semibold">
              <Download className="w-5 h-5" />
              Export
            </button>
            <button onClick={refetch} className="p-3 hover:bg-gray-100 rounded-xl transition-all" title="Refresh">
              <RefreshCw className={`w-5 h-5 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-700 font-medium">Loading requests...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Request Cards ── */}
            <div className="lg:col-span-2 space-y-4">
              {finalRequests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-gray-200">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No requests found</p>
                </div>
              ) : (
                finalRequests.map((request) => {
                  const statusInfo = getStatusInfo(request);
                  const priority   = getPriorityFromCost(request.new_project_cost);
                  const overdue    = isOverdue(request);
                  const isPinned   = pinnedIds.includes(request.cdb_object_id);
                  const isDraft    = (request.car_status || 'Created').toLowerCase() === 'created';

                  return (
                    <div key={request.cdb_object_id}
                      className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 hover:shadow-md transition-all">

                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-md font-bold text-gray-900 truncate">
                              {request.project_name || 'Untitled'}
                            </h2>
                            {isPinned && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-bold">PINNED</span>
                            )}
                            {overdue && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-bold">OVERDUE</span>
                            )}
                          </div>
                          <p className="text-gray-600 font-medium">CAR #{request.car_no || 'N/A'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <button onClick={() => togglePin(request.cdb_object_id)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-all"
                            title={isPinned ? 'Unpin' : 'Pin to top'}>
                            <Star className={`w-5 h-5 ${isPinned ? 'text-yellow-400 fill-yellow-300' : 'text-gray-400'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Cost Badge */}
                      <div className="mb-4 inline-block bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg font-bold">
                        {formatCurrency(request.new_project_cost || 0)}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-md">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-gray-900 truncate font-medium">
                            <span className="font-bold">Requester:</span> {request.requester_name || 'N/A'}
                          </span>
                        </div>
                        {request.c_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            <span className="text-gray-900 font-medium">
                              Created On: {new Date(request.c_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {request.date_comm && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            <span className="text-gray-900 truncate font-medium">
                              <span className="font-bold">Comm. Date:</span>{' '}
                              {new Date(request.date_comm).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {request.is_capital_budget === '1' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-900 font-bold">Capital Budget</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${priority.color}`} />
                          <span className="text-sm text-gray-900 capitalize font-bold">{priority.level} priority</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openView(request)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="View details">
                            <Eye className="w-5 h-5 text-gray-700" />
                          </button>
                          {isDraft && (
                            <>
                              <button onClick={() => openEdit(request)} disabled={isUpdating}
                                className="p-2 hover:bg-indigo-100 rounded-lg transition-all disabled:opacity-50" title="Edit">
                                <Edit className="w-5 h-5 text-indigo-600" />
                              </button>
                              <button onClick={() => handleDelete(request)} disabled={isDeleting}
                                className="p-2 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50" title="Delete">
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            </>
                          )}
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="More options">
                            <MoreVertical className="w-5 h-5 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Right Sidebar ── */}
            <div className="space-y-6">

              {/* Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Overview</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Total Requests', value: stats.total,    bg: 'bg-blue-50',   border: 'border-blue-200',   Icon: FileText,    iconColor: 'text-blue-600'   },
                    { label: 'Pending',         value: stats.pending,  bg: 'bg-orange-50', border: 'border-orange-200', Icon: Clock,       iconColor: 'text-orange-600' },
                    { label: 'Approved',        value: stats.approved, bg: 'bg-green-50',  border: 'border-green-200',  Icon: CheckCircle, iconColor: 'text-green-600'  },
                    { label: 'Rejected',        value: stats.rejected, bg: 'bg-red-50',    border: 'border-red-200',    Icon: XCircle,     iconColor: 'text-red-600'    },
                  ].map(({ label, value, bg, border, Icon, iconColor }) => (
                    <div key={label} className={`flex items-center justify-between p-4 ${bg} rounded-xl border-2 ${border}`}>
                      <div>
                        <p className="text-sm text-gray-700 font-bold">{label}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                      </div>
                      <Icon className={`w-10 h-10 ${iconColor}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Value */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/90 text-sm mb-1 font-semibold">Total Value</p>
                    <p className="text-4xl font-bold">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-white/80" />
                </div>
                <div className="text-sm text-white/90 font-medium">
                  Across {stats.total} request{stats.total !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Priority Mix */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Mix</h3>
                <div className="space-y-3">
                  {[
                    { label: 'High Priority',   count: priorityStats.high,   pct: highPct, color: 'bg-red-400'    },
                    { label: 'Medium Priority', count: priorityStats.medium, pct: medPct,  color: 'bg-yellow-400' },
                    { label: 'Low Priority',    count: priorityStats.low,    pct: lowPct,  color: 'bg-green-400'  },
                  ].map(({ label, count, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
                        <span>{label}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-2 ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Create New Request', Icon: Plus,      onClick: openAdd       },
                    { label: 'Export to Excel',    Icon: Download,  onClick: exportToExcel },
                    { label: 'View Analytics',     Icon: BarChart3, onClick: () => {}      },
                  ].map(({ label, Icon, onClick }) => (
                    <button key={label} onClick={onClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-all text-left border-2 border-transparent hover:border-indigo-200">
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-bold text-gray-900">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {modalMode === 'view' ? (
              <CarRequestDetail
                carData={editing}
                onClose={closeModal}
                onEdit={switchToEdit}
              />
            ) : (
              <CarRequestForm
                initialData={editing}
                onSave={handleSave}
                onCancel={closeModal}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarRequestView;