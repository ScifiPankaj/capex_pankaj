import React, { useMemo, useState } from 'react';
import {
  Search, Plus, Edit2, Trash2, Save, Building, Package, FileText, Leaf,
  CheckCircle, AlertCircle, Home, BarChart3, Settings, Users, X, RefreshCw, TrendingUp
} from 'lucide-react';

import {
  useGetPlantsQuery,
  useGetRequirementsQuery,
  useGetNatureAssetsQuery,
  useGetItemSourcesQuery,
  useGetEsgImpactsQuery,
  useMutateMasterMutation,
} from '../entities/masters/mastersApi';



const API_BASE = 'http://localhost:8080/api/v1/collection';


const MASTER_CONFIGS = {
  'kln_plantmaster': {
    title: 'Plant Master',
    icon: Building,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    endpoint: '/kln_plantmaster',
    idField: 'plant_code',
    idType: 'number',
    fields: [
      { name: 'plant_code', label: 'Plant Code', type: 'number', required: true, readonly: false },
      { name: 'plant_name', label: 'Plant Name', type: 'text', required: true },
      { name: 'plant_location', label: 'Plant Location', type: 'text', required: true }
    ],
    displayPrimary: 'plant_name',
    displaySecondary: ['plant_code', 'plant_location']
  },
  'car_requirement_type': {
    title: 'Requirement Type Master',
    icon: FileText,

    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    endpoint: '/car_requirement_type',
    idField: 'requirement_code',
    idType: 'number',
    fields: [
      { name: 'requirement_code', label: 'Requirement Code', type: 'number', required: true },
      { name: 'requirement_name', label: 'Requirement Name', type: 'text', required: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', required: false }
    ],
    displayPrimary: 'requirement_name',
    displaySecondary: ['requirement_code']
  },
  'car_nature_asset': {
    title: 'Nature of Assets',
    icon: Package,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    endpoint: '/car_nature_asset',
    idField: 'cdb_object_id',
    idType: 'text',
    fields: [
      { name: 'nature_asset_id', label: 'Asset ID', type: 'number', required: true },
      { name: 'asset_name', label: 'Asset Name', type: 'text', required: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', required: false }
    ],
    displayPrimary: 'asset_name',
    displaySecondary: ['nature_asset_id']
  },
  'car_item_source': {
    title: 'Item Source Types',
    icon: FileText,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    endpoint: '/car_item_source',
    idField: 'cdb_object_id',
    idType: 'text',
    fields: [
      { name: 'source_id', label: 'Source ID', type: 'number', required: true },
      { name: 'source_type', label: 'Source Type', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', required: false }
    ],
    displayPrimary: 'name',
    displaySecondary: ['source_type', 'code']
  },
  'car_esg_impacts': {
    title: 'ESG Impacts',
    icon: Leaf,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    endpoint: '/car_esg_impacts',
    idField: 'cdb_object_id',
    idType: 'text',
    fields: [
      { name: 'esg_id', label: 'ESG ID', type: 'number', required: true },
      { name: 'name', label: 'Impact Name', type: 'text', required: true },
      { name: 'is_active', label: 'Active', type: 'checkbox', required: false }
    ],
    displayPrimary: 'name',
    displaySecondary: ['esg_id']
  }
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'masters', label: 'Masters', icon: Settings },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users }
];

  const CapexMastersSetup = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMaster, setCurrentMaster] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeNav, setActiveNav] = useState('masters');

  // RTK Query reads
  const plantsQ   = useGetPlantsQuery();
  const reqQ      = useGetRequirementsQuery();
  const natureQ   = useGetNatureAssetsQuery();
  const srcQ      = useGetItemSourcesQuery();
  const esgQ      = useGetEsgImpactsQuery();

  const [mutateMaster] = useMutateMasterMutation();

  // helper: normalize server shapes
  const extractArray = (result) => {
    if (Array.isArray(result)) return result;
    const possible = ['objects','data','items','results','rows'];
    for (const k of possible) if (result && Array.isArray(result[k])) return result[k];
    if (result && typeof result === 'object') {
      const k = Object.keys(result).find(k => Array.isArray(result[k]));
      if (k) return result[k];
    }
    return [];
  };
  const normalizeActive = (arr) =>
    extractArray(arr).map((x) => ({
      ...x,
      ...(x.hasOwnProperty('is_active') ? { is_active: !!(x.is_active === 1 || x.is_active === '1' || x.is_active === true) } : {})
    }));

  // combine all masters into the same shape your UI expects
  const masterData = useMemo(() => ({
    kln_plantmaster:    normalizeActive(plantsQ.data),
    car_requirement_type: normalizeActive(reqQ.data),
    car_nature_asset:   normalizeActive(natureQ.data),
    car_item_source:    normalizeActive(srcQ.data),
    car_esg_impacts:    normalizeActive(esgQ.data),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [plantsQ.data, reqQ.data, natureQ.data, srcQ.data, esgQ.data]);

  const loading = plantsQ.isLoading || reqQ.isLoading || natureQ.isLoading || srcQ.isLoading || esgQ.isLoading;

  const refetchAll = () => {
    plantsQ.refetch(); reqQ.refetch(); natureQ.refetch(); srcQ.refetch(); esgQ.refetch();
  };

  const openModal = (masterKey, item = null) => {
    setCurrentMaster(masterKey);
    setEditingItem(item);
    setErrorMessage('');
    if (item) setFormData({ ...item });
    else {
      const initial = {};
      MASTER_CONFIGS[masterKey].fields.forEach(f => {
        initial[f.name] = f.type === 'checkbox' ? true : '';
      });
      setFormData(initial);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentMaster(null);
    setEditingItem(null);
    setFormData({});
    setErrorMessage('');
  };

  // SAVE via generic mutation
  const handleSave = async () => {
    const cfg = MASTER_CONFIGS[currentMaster];
    const endpoint = `${API_BASE}${cfg.endpoint}`;
    const submit = { ...formData };

    // number casting
    cfg.fields.forEach(f => {
      if (f.type === 'number' && submit[f.name] !== '' && submit[f.name] !== undefined && submit[f.name] !== null) {
        submit[f.name] = Number(submit[f.name]);
      }
    });
    if ('is_active' in submit) submit.is_active = submit.is_active ? 1 : 0;

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `${endpoint}/${editingItem[cfg.idField]}` : endpoint;
      const res = await mutateMaster({ url, method, body: JSON.stringify(submit) }).unwrap();
      closeModal();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      // lists are invalidated automatically; still can manual refetch if you want:
      // refetchAll();
    } catch (e) {
      setErrorMessage(`Error: ${e?.data || e?.error || e?.message || 'Unknown error'}`);
    }
  };

  // DELETE via generic mutation
  const handleDelete = async (masterKey, item) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const cfg = MASTER_CONFIGS[masterKey];
    const url = `${API_BASE}${cfg.endpoint}/${item[cfg.idField]}`;
    try {
      await mutateMaster({ url, method: 'DELETE' }).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      // refetchAll();
    } catch (e) {
      alert(`Error deleting item: ${e?.data || e?.error || e?.message || 'Unknown error'}`);
    }
  };

  const filterItems = (items) =>
    !searchTerm ? items : items.filter((it) => JSON.stringify(it).toLowerCase().includes(searchTerm.toLowerCase()));

  const getTotalItems = () =>
    Object.values(masterData).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Left Sidebar */}
      <div style={{
        width: '220px',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)'
      }}>
        {/* Logo */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '18px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}>K</div>
            <div>
              <div style={{ fontWeight: 'bold', color: 'white', fontSize: '15px', letterSpacing: '-0.3px' }}>CAPEX Pro</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Management Suite</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', paddingLeft: '8px', letterSpacing: '0.5px' }}>
            MAIN MENU
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '13px',
                    textAlign: 'left',
                    width: '100%',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    }
                  }}
                >
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      left: '0',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '20px',
                      background: '#3b82f6',
                      borderRadius: '0 2px 2px 0'
                    }}></div>
                  )}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Stats Card */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <TrendingUp size={14} color="#60a5fa" />
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Records</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
              {getTotalItems()}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Across all masters</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '12px 20px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>
              {activeNav === 'masters' ? 'Masters Configuration' : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Manage your system master data with full CRUD operations</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} size={16} />
              <input
                type="text"
                placeholder="Search across all masters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '38px',
                  paddingRight: '14px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  width: '260px',
                  outline: 'none',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                  background: '#f8fafc'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              onClick={refetchAll}
              disabled={loading}
              style={{
                padding: '8px 14px',
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#64748b',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.color = '#3b82f6';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>

            {saveSuccess && (
              <div style={{
                padding: '8px 14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                animation: 'slideIn 0.3s ease-out'
              }}>
                <CheckCircle size={16} />
                Operation Successful!
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div style={{
          flex: 1,
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '14px',
          overflow: 'auto'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  animation: 'spin 1s linear infinite',
                  borderRadius: '50%',
                  height: '48px',
                  width: '48px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#3b82f6',
                  margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500' }}>Loading masters data...</p>
              </div>
            </div>
          ) : (
            Object.entries(MASTER_CONFIGS).map(([masterKey, config]) => {
              const Icon = config.icon;
              const items = filterItems(masterData[masterKey] || []);

              return (
                <div key={masterKey} style={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: 'calc(50vh - 50px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  {/* Section Header */}
                  <div style={{
                    padding: '14px 16px',
                    background: config.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}>
                        <Icon size={20} color="white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: '0 0 2px 0', letterSpacing: '-0.3px' }}>
                          {config.title}
                        </h3>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: '500' }}>
                          {items.length} {items.length === 1 ? 'entry' : 'entries'} • ID: {config.idField}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal(masterKey)}
                      style={{
                        padding: '8px 14px',
                        background: 'white',
                        color: config.color,
                        borderRadius: '8px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                      }}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      Add New
                    </button>
                  </div>

                  {/* Items List */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {items.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: `${config.color}10`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px'
                        }}>
                          <AlertCircle size={28} color={config.color} strokeWidth={2} />
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 6px 0' }}>No entries yet</h4>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>Get started by adding your first entry</p>
                        <button
                          onClick={() => openModal(masterKey)}
                          style={{
                            padding: '8px 16px',
                            background: config.gradient,
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Plus size={16} />
                          Add Entry
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {items.map((item, idx) => (
                          <div
                            key={item[config.idField] || idx}
                            style={{
                              padding: '10px 12px',
                              background: '#f8fafc',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s',
                              border: '1px solid #e5e7eb'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = config.color;
                              e.currentTarget.style.boxShadow = `0 4px 12px ${config.color}20`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <div style={{
                                  fontWeight: '600',
                                  color: '#0f172a',
                                  fontSize: '14px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {item[config.displayPrimary] || 'N/A'}
                                </div>
                                {item.is_active !== undefined && (
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    background: item.is_active ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e5e7eb',
                                    color: item.is_active ? 'white' : '#64748b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px'
                                  }}>
                                    {item.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {config.displaySecondary.map((field, i) => item[field]).filter(Boolean).join(' • ')}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '10px' }}>
                              <button
                                onClick={() => openModal(masterKey, item)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#eff6ff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#3b82f6';
                                  e.currentTarget.querySelector('svg').style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#eff6ff';
                                  e.currentTarget.querySelector('svg').style.color = '#3b82f6';
                                }}
                              >
                                <Edit2 size={14} color="#3b82f6" />
                              </button>
                              <button
                                onClick={() => handleDelete(masterKey, item)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#fef2f2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#ef4444';
                                  e.currentTarget.querySelector('svg').style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fef2f2';
                                  e.currentTarget.querySelector('svg').style.color = '#ef4444';
                                }}
                              >
                                <Trash2 size={14} color="#ef4444" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && currentMaster && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}>


          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            animation: 'slideUp 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '24px',
              background: MASTER_CONFIGS[currentMaster].gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  {React.createElement(MASTER_CONFIGS[currentMaster].icon, { size: 24, color: 'white', strokeWidth: 2.5 })}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                    {editingItem ? 'Edit' : 'Add New'} {MASTER_CONFIGS[currentMaster].title}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                    {editingItem ? `Updating record with ${MASTER_CONFIGS[currentMaster].idField}` : 'Fill in the required details'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                }}
              >
                <X size={20} color="white" />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {errorMessage && (
                <div style={{
                  padding: '12px',
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  {errorMessage}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {MASTER_CONFIGS[currentMaster].fields.map(field => (
                  <div key={field.name}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#0f172a',
                      fontSize: '14px'
                    }}>
                      {field.label}
                      {field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                      {field.name === MASTER_CONFIGS[currentMaster].idField && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          PRIMARY KEY
                        </span>
                      )}
                    </label>
                    {field.type === 'checkbox' ? (
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '14px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = MASTER_CONFIGS[currentMaster].color;
                        e.currentTarget.style.background = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#f8fafc';
                      }}>
                        <input
                          type="checkbox"
                          checked={formData[field.name] || false}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: MASTER_CONFIGS[currentMaster].color
                          }}
                        />
                        <span style={{ color: '#475569', fontWeight: '500', fontSize: '14px' }}>Mark as active</span>
                      </label>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        disabled={editingItem && field.name === MASTER_CONFIGS[currentMaster].idField}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '10px',
                          outline: 'none',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          background: (editingItem && field.name === MASTER_CONFIGS[currentMaster].idField) ? '#f1f5f9' : '#f8fafc',
                          transition: 'all 0.2s',
                          fontWeight: '500',
                          color: '#0f172a',
                          cursor: (editingItem && field.name === MASTER_CONFIGS[currentMaster].idField) ? 'not-allowed' : 'text'
                        }}
                        onFocus={(e) => {
                          if (!(editingItem && field.name === MASTER_CONFIGS[currentMaster].idField)) {
                            e.target.style.borderColor = MASTER_CONFIGS[currentMaster].color;
                            e.target.style.background = 'white';
                            e.target.style.boxShadow = `0 0 0 3px ${MASTER_CONFIGS[currentMaster].color}20`;
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.background = (editingItem && field.name === MASTER_CONFIGS[currentMaster].idField) ? '#f1f5f9' : '#f8fafc';
                          e.target.style.boxShadow = 'none';
                        }}
                        required={field.required}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e5e7eb',
              background: '#f8fafc',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: '600',
                  color: '#475569',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#94a3b8';
                  e.target.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.background = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '12px 24px',
                  background: MASTER_CONFIGS[currentMaster].gradient,
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 12px ${MASTER_CONFIGS[currentMaster].color}40`
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 16px ${MASTER_CONFIGS[currentMaster].color}50`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 12px ${MASTER_CONFIGS[currentMaster].color}40`;
                }}
              >
                <Save size={18} />
                {editingItem ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
    </div>
  );
};

export default CapexMastersSetup;