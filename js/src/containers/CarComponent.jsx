// src/containers/CarComponent.jsx
import React, { useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Bell,
  User,
  Download,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  MoreVertical,
  DollarSign,
  RefreshCw,
  Eye,
  Star,
} from 'lucide-react';

import {
  useGetCarRequestsQuery,
  useAddCarRequestMutation,
  useUpdateCarRequestMutation,
  useDeleteCarRequestMutation,
  useCreateCarNumberMutation,
  useAddCarItemMutation,
} from '../reducers/features/CarForm/carRequestApi';

// ✅ Import both the form/wizard and the view component
import CarRequestForm from '../components/car/CarRequestForm';
import CarRequestView from '../components/car/CarRequestView';


const CarComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all'); // NEW
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', or 'view'
  const [pinnedIds, setPinnedIds] = useState([]); // NEW: pinned CARs

  // RTK Query hooks
  const { data: apiData, isLoading, error, refetch } = useGetCarRequestsQuery();
  const [addCarRequest, { isLoading: isAdding }] = useAddCarRequestMutation();
  const [updateCarRequest, { isLoading: isUpdating }] = useUpdateCarRequestMutation();
  const [deleteCarRequest, { isLoading: isDeleting }] = useDeleteCarRequestMutation();
  const [createCarNumber] = useCreateCarNumberMutation();
  const [addCarItem] = useAddCarItemMutation();

  // Extract requests from API response
  const requests = apiData?.objects || [];

  // Calculate stats from real data
  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) =>
        r.car_status === 'Created' ||
        r.car_status === 'Submitted' ||
        !r.car_status
    ).length,
    approved: requests.filter((r) => r.car_status === 'Approved').length,
    rejected: requests.filter((r) => r.car_status === 'Rejected').length,
    totalValue: requests.reduce(
      (sum, r) => sum + (parseFloat(r.new_project_cost) || 0),
      0
    ),
  };

  // Priority distribution for analytics
  const getPriorityLevel = (cost) => {
    const amount = parseFloat(cost) || 0;
    if (amount > 5000000) return 'high';
    if (amount > 1000000) return 'medium';
    return 'low';
  };

  const priorityStats = requests.reduce(
    (acc, r) => {
      const level = getPriorityLevel(r.new_project_cost);
      acc[level] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num.toFixed(0)}`;
  };

  const getStatusInfo = (request) => {
    const status = request.car_status || 'Created';
    const statusMap = {
      Created: {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        label: 'Draft',
      },
      Submitted: {
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        label: 'Pending',
      },
      Approved: {
        color: 'bg-green-100 text-green-800 border-green-300',
        label: 'Approved',
      },
      Rejected: {
        color: 'bg-red-100 text-red-800 border-red-300',
        label: 'Rejected',
      },
    };
    return statusMap[status] || statusMap['Created'];
  };

  const getPriorityFromCost = (cost) => {
    const amount = parseFloat(cost) || 0;
    if (amount > 5000000)
      return { level: 'high', color: 'bg-red-500', emoji: '🔴' };
    if (amount > 1000000)
      return { level: 'medium', color: 'bg-yellow-500', emoji: '🟡' };
    return { level: 'low', color: 'bg-green-500', emoji: '🟢' };
  };

  const isOverdue = (request) => {
    // Overdue: Submitted/Pending older than 7 days
    const status = (request.car_status || 'Created').toLowerCase();
    if (status !== 'submitted' && status !== 'pending') return false;
    if (!request.date_comm) return false;

    const commDate = new Date(request.date_comm);
    if (Number.isNaN(commDate.getTime())) return false;

    const now = new Date();
    const diffMs = now - commDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  };

  const togglePin = (id) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      (request.project_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request.car_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.requester_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request.dept || '').toLowerCase().includes(searchTerm.toLowerCase());

    const status = (request.car_status || 'Created').toLowerCase();
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'draft' && status === 'created') ||
      (statusFilter === 'pending' &&
        (status === 'submitted' || !request.car_status)) ||
      status === statusFilter;

    const level = getPriorityLevel(request.new_project_cost);
    const matchesPriority =
      priorityFilter === 'all' || level === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const parseDateSafe = (d) => {
    if (!d) return 0;
    const ts = new Date(d).getTime();
    return Number.isNaN(ts) ? 0 : ts;
  };

  const parseNumSafe = (v) => {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  };

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aSubmitted = parseDateSafe(a.submitted_on);
    const bSubmitted = parseDateSafe(b.submitted_on);

    const aHasSubmitted = aSubmitted > 0;
    const bHasSubmitted = bSubmitted > 0;

    // 1️⃣ Pehle: jinme submitted_on hai wo upar
    if (aHasSubmitted && !bHasSubmitted) return -1; // a upar
    if (!aHasSubmitted && bHasSubmitted) return 1;  // b upar

    // 2️⃣ Dono ke paas submitted_on hai → newest first
    if (aHasSubmitted && bHasSubmitted && aSubmitted !== bSubmitted) {
      return bSubmitted - aSubmitted; // desc
    }

    // 3️⃣ Dono ke paas submitted_on nahi hai → commissioning date se sort
    const aComm = parseDateSafe(a.date_comm);
    const bComm = parseDateSafe(b.date_comm);
    if (aComm !== bComm) {
      return bComm - aComm; // desc
    }

    // 4️⃣ Last fallback: CAR no desc
    const aNum = parseNumSafe(a.car_no);
    const bNum = parseNumSafe(b.car_no);
    return bNum - aNum;
  });




  // Pinned on top
  const finalRequests = [...sortedRequests].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.cdb_object_id);
    const bPinned = pinnedIds.includes(b.cdb_object_id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  const handleSave = async (formData) => {
    try {
      if (editing) {
        // 🔄 EDIT MODE – proper payload for RTK Query (id + body)
        await updateCarRequest({
          id: editing.cdb_object_id,
          body: formData,
        }).unwrap();

        alert('✅ Request updated successfully!');
      } else {
        console.group('🚗 CREATE CAR FLOW');

        // 1️⃣ CAR number from internal API
        const numberResp = await createCarNumber().unwrap();
        console.log('🔢 CAR number API response →', numberResp);

        const car_no = numberResp?.car_no;

        // 2️⃣ Payload + CAR number
        const payloadWithCarNo = {
          ...formData,
          car_no, // DB column name
        };
        console.log('📤 Final payload with car_no →', payloadWithCarNo);

        // 3️⃣ Create CAR
        const created = await addCarRequest(payloadWithCarNo).unwrap();
        console.log('✅ Created CAR:', created);

        // 4️⃣ Agar FINAL SUBMIT hai tabhi items save karo
        const status = (payloadWithCarNo.car_status || '').toLowerCase();
        if (status === 'submitted') {
          console.group('📦 Saving CAR items');

          // UI se aaya hua JSON string
          let uiItems = [];
          try {
            uiItems = JSON.parse(formData.project_items_json || '[]');
          } catch (e) {
            console.error('❌ Failed to parse project_items_json', e);
          }

          if (Array.isArray(uiItems) && uiItems.length > 0) {
            const itemsPayload = uiItems.map((item, index) => {
              const qty = Number(item.quantity) || 0;
              const netPrice = Number(item.netPrice) || 0;
              const total = qty * netPrice;
              const condition = item.isNew ?? item.condition ?? 'New';

              return {
                car_no: car_no ? parseInt(car_no, 10) : null, // integer FK
                description_text: item.description || '',
                source_id: item.sourceId ? Number(item.sourceId) : null,
                is_new: condition === 'New' ? 1 : 0, // 1 = New, 0 = Second Hand
                qty,
                net_price: netPrice,
                total_price: total,
                r_order: index + 1,
                remarks: item.remarks || '',
              };
            });

            console.log('📦 Final items payload →', itemsPayload);
            await Promise.all(itemsPayload.map((p) => addCarItem(p).unwrap()));
            console.log('✅ All CAR items saved successfully');
          } else {
            console.log('ℹ️ No project items to save');
          }

          console.groupEnd();
        } else {
          console.log('ℹ️ Status is draft, skipping item save');
        }

        alert(`✅ Request created successfully!\nCAR No: ${car_no || 'N/A'}`);
        console.groupEnd();
      }

      setModalOpen(false);
      setEditing(null);
      setModalMode('create');
      refetch();
    } catch (err) {
      console.error('Save failed:', err);
      alert(
        '❌ Failed to save request: ' +
        (err?.data?.message || err?.message || 'Unknown error')
      );
    }
  };

  const handleDelete = async (request) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${request.project_name}"?`
      )
    )
      return;
    try {
      await deleteCarRequest(request.cdb_object_id).unwrap();
      alert('✅ Request deleted successfully!');
      refetch();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('❌ Failed to delete request');
    }
  };

  const openAdd = () => {
    setEditing(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (request) => {
    setEditing(request);
    setModalMode('edit');
    setModalOpen(true);
  };

  // ✅ NEW: Open in pure view mode (read-only)
  const openView = (request) => {
    setEditing(request);
    setModalMode('view');
    setModalOpen(true);
  };

  // ✅ NEW: Switch from view mode to edit mode
  const switchToEdit = () => {
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setModalMode('create');
  };

  const exportToExcel = () => {
    alert('Export feature coming soon!');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-700 mb-4 font-medium">
            Failed to connect to API: {error?.error || error?.status || 'Unknown error'}
          </p>
          <button
            onClick={refetch}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all font-semibold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const highPct =
    stats.total > 0 ? Math.round((priorityStats.high / stats.total) * 100) : 0;
  const medPct =
    stats.total > 0
      ? Math.round((priorityStats.medium / stats.total) * 100)
      : 0;
  const lowPct =
    stats.total > 0 ? Math.round((priorityStats.low / stats.total) * 100) : 0;

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 mb-6">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
{/*                 Dashboard */}
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
{/*                 Capital Appropriation Request Management */}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-all relative">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
              >
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

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-gray-900 bg-white"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Sort */}
            {/* <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-gray-900 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="cost-high">Highest Cost</option>
              <option value="cost-low">Lowest Cost</option>
              <option value="name-az">Project Name A-Z</option>
            </select> */}

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-semibold"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={refetch}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-700 ${isLoading ? 'animate-spin' : ''
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
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
            {/* Left Column - Request Cards */}
            <div className="lg:col-span-2 space-y-4">
              {finalRequests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-gray-200">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No requests found</p>
                </div>
              ) : (
                finalRequests.map((request) => {
                  const statusInfo = getStatusInfo(request);
                  const priority = getPriorityFromCost(
                    request.new_project_cost
                  );
                  const overdue = isOverdue(request);
                  const isPinned = pinnedIds.includes(request.cdb_object_id);

                  return (
                    <div
                      key={request.cdb_object_id}
                      className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 hover:shadow-md transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-md font-bold text-gray-900 truncate">
                              {request.project_name || 'Untitled'}
                            </h2>
                            {isPinned && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-bold">
                                PINNED
                              </span>
                            )}
                            {overdue && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-bold">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-medium">
                            CAR #{request.car_no || 'N/A'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                          <button
                            onClick={() =>
                              togglePin(request.cdb_object_id)
                            }
                            className="p-1 rounded-full hover:bg-gray-100 transition-all"
                            title={isPinned ? 'Unpin' : 'Pin to top'}
                          >
                            <Star
                              className={`w-5 h-5 ${isPinned
                                ? 'text-yellow-400 fill-yellow-300'
                                : 'text-gray-400'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Cost Badge */}
                      <div className="mb-4 inline-block bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-lg font-bold">
                        {formatCurrency(request.new_project_cost || 0)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-md">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-gray-900 truncate font-medium">
                            <span className="font-bold">Requester:</span>{' '}
                            {request.requester_name || 'N/A'}
                          </span>
                        </div>
                        {/* <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-gray-900 truncate font-medium">
                            <span className="font-bold">Req Code:</span>{' '}
                            {request.requirement_name || 'N/A'}
                          </span>
                        </div> */}
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
                              {new Date(
                                request.date_comm
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {request.is_capital_budget === '1' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-900 font-bold">
                              Capital Budget
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${priority.color}`}
                          />
                          <span className="text-sm text-gray-900 capitalize font-bold">
                            {priority.level} priority
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {(() => {
                            const status = (
                              request.car_status || 'Created'
                            ).toLowerCase();
                            const isDraft =
                              status === 'created' || status === 'draft';

                            if (isDraft) {
                              // 👉 Draft: View + Edit + Delete
                              return (
                                <>
                                  <button
                                    onClick={() => openView(request)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                                    title="View details"
                                  >
                                    <Eye className="w-5 h-5 text-gray-700" />
                                  </button>

                                  <button
                                    onClick={() => openEdit(request)}
                                    disabled={isUpdating}
                                    className="p-2 hover:bg-indigo-100 rounded-lg transition-all disabled:opacity-50"
                                    title="Edit"
                                  >
                                    <Edit className="w-5 h-5 text-indigo-600" />
                                  </button>

                                  <button
                                    onClick={() => handleDelete(request)}
                                    disabled={isDeleting}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                  </button>
                                </>
                              );
                            }

                            // 👉 Submitted / Approved / Rejected: only View button
                            return (
                              <button
                                onClick={() => openView(request)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                                title="View details"
                              >
                                <Eye className="w-5 h-5 text-gray-700" />
                              </button>
                            );
                          })()}

                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            title="More options"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column - Summary / Analytics */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div>
                      <p className="text-sm text-gray-700 font-bold">
                        Total Requests
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    </div>
                    <FileText className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                    <div>
                      <p className="text-sm text-gray-700 font-bold">
                        Pending
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.pending}
                      </p>
                    </div>
                    <Clock className="w-10 h-10 text-orange-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <div>
                      <p className="text-sm text-gray-700 font-bold">
                        Approved
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.approved}
                      </p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <div>
                      <p className="text-sm text-gray-700 font-bold">
                        Rejected
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.rejected}
                      </p>
                    </div>
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Total Value Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/90 text-sm mb-1 font-semibold">
                      Total Value
                    </p>
                    <p className="text-4xl font-bold">
                      {formatCurrency(stats.totalValue)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-white/80" />
                </div>
                <div className="text-sm text-white/90 font-medium">
                  Across {stats.total} request
                  {stats.total !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Priority Mix
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
                      <span>High Priority</span>
                      <span>
                        {priorityStats.high} ({highPct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-red-400"
                        style={{ width: `${highPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
                      <span>Medium Priority</span>
                      <span>
                        {priorityStats.medium} ({medPct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-yellow-400"
                        style={{ width: `${medPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
                      <span>Low Priority</span>
                      <span>
                        {priorityStats.low} ({lowPct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-green-400"
                        style={{ width: `${lowPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={openAdd}
                    className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-all text-left border-2 border-transparent hover:border-indigo-200"
                  >
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-gray-900">
                      Create New Request
                    </span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-all text-left border-2 border-transparent hover:border-indigo-200"
                  >
                    <Download className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-gray-900">
                      Export to Excel
                    </span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-all text-left border-2 border-transparent hover:border-indigo-200">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-gray-900">
                      View Analytics
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ MODAL: Conditionally render either VIEW or FORM */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
            {modalMode === 'view' ? (
              // 👁️ VIEW MODE: Show CarRequestView (read-only)
              <CarRequestView
                carData={editing}
                onClose={closeModal}
                onEdit={switchToEdit} // Allow switching to edit mode
              />
            ) : (
              // ✏️ EDIT/CREATE MODE: Show CarRequestForm
              <CarRequestForm
                initialData={editing}
                onSave={handleSave}
                onCancel={closeModal}
                isSaving={isAdding || isUpdating}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarComponent;
