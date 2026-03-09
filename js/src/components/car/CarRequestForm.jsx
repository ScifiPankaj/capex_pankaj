// src/components/car/CarRequestForm.jsx
import React, { useState } from 'react';
import { X, Save, Send, Phone } from 'lucide-react';

import Step1BasicInformation from './Step1BasicInformation';
import Step2ProjectDetails   from './Step2ProjectDetails';
import Step3FinancialDetails from './Step3FinancialDetails';
import Step4ReviewSubmit     from './Step4ReviewSubmit';

import {
  useAddCarRequestMutation,
  useAddCarItemMutation,
  useUpdateCarRequestMutation,
  useUpdateCarItemMutation,
} from '../../reducers/features/CarForm/carRequestApi';

import apiAuth from '../../utils/apiAuth';

// ── Endpoints ──────────────────────────────────────────────
const CAR_NUMBER_ENDPOINT = '/internal/car_number'; // GET  → { success, car_no }
const CAR_ITEM_ENDPOINT   = '/api/v1/collection/car_item_type';

// ── Initial state builder ──────────────────────────────────
const buildInitialState = (initialData) => ({
  plantCode:            initialData?.plant_code               || '',
  sapPlantCode:         initialData?.sap_plant_code           || '',
  department:           initialData?.dept                     || '',
  requesterName:        initialData?.requester_name           || '',
  budgetCategory:       'CAPEX',
  isPartOfProject:      initialData
                          ? (initialData.ispart_project === 1 ? 'yes'
                           : initialData.ispart_project === 0 ? 'no' : '')
                          : '',
  originalProjectCost:  initialData?.original_project_cost   || '',
  totalAppropriation:   initialData?.total_appropriation_cost || '',
  newProjectCost:       initialData?.new_project_cost        || '',
  standaloneRemark:     initialData?.standalone_remark       || '',
  projectName:          initialData?.project_name            || '',
  commissioningDate:    initialData?.date_comm               || '',
  natureOfAsset:        initialData?.nature_of_asset         || [],
  requirementType:      initialData?.requirement_code
                          ? String(initialData.requirement_code).split(',')
                          : [],
  justification:        initialData?.justification           || '',
  paybackPeriod:        initialData?.payback_period          || '',
  projectIRR:           initialData?.project_irr             || '',
  projectItems:         initialData?.project_items           || [],
  esgImpactDetails:     initialData?.esg_impact_details      || '',
  esgImpactCategories:  initialData?.esg_impact_categories   || [],
  isCapitalBudget:      initialData
                          ? (initialData.is_capital_budget === 1 ? 'yes'
                           : initialData.is_capital_budget === 0 ? 'no' : '')
                          : '',
  declaration: false,
});

// ──────────────────────────────────────────────────────────
const CarRequestForm = ({ initialData = null, onSave, onCancel }) => {
  const [currentStep, setCurrentStep]       = useState(1);
  const [formData, setFormData]             = useState(() => buildInitialState(initialData));
  const [errors, setErrors]                 = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSaving, setIsSaving]             = useState(false);

  // ── RTK mutations (for cache invalidation) ────────────
  const [addCarRequest]   = useAddCarRequestMutation();
  const [addCarItem]      = useAddCarItemMutation();
  const [updateCarRequest]= useUpdateCarRequestMutation();
  const [updateCarItem]   = useUpdateCarItemMutation();

  // ── Wizard config ─────────────────────────────────────
  const wizardSteps = [
    { number: 1, title: 'Project Info',      subtitle: 'Basic details',                component: Step1BasicInformation },
    { number: 2, title: 'Project Details',   subtitle: 'Requirements & justification', component: Step2ProjectDetails   },
    { number: 3, title: 'Financial Details', subtitle: 'Cost & budget',                component: Step3FinancialDetails },
    { number: 4, title: 'Review & Submit',   subtitle: 'Final review',                 component: Step4ReviewSubmit     },
  ];

  // ── Field helpers ─────────────────────────────────────
  const handleUpdateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleToggleArrayItem = (arrayField, itemId) => {
    setFormData(prev => {
      const cur = (prev[arrayField] || []).map(String);
      const id  = String(itemId);
      return {
        ...prev,
        [arrayField]: cur.includes(id) ? cur.filter(v => v !== id) : [...cur, id],
      };
    });
  };

  // ── Project item helpers ──────────────────────────────
  const handleAddProjectItem = () =>
    setFormData(prev => ({
      ...prev,
      projectItems: [
        ...(prev.projectItems || []),
        { description: '', sourceId: '', isNew: 'New', quantity: 1, netPrice: 0, remarks: '' },
      ],
    }));

  const handleUpdateProjectItem = (index, field, value) =>
    setFormData(prev => {
      const items = [...(prev.projectItems || [])];
      if (items[index]) items[index] = { ...items[index], [field]: value };
      return { ...prev, projectItems: items };
    });

  const handleRemoveProjectItem = (index) =>
    setFormData(prev => ({
      ...prev,
      projectItems: (prev.projectItems || []).filter((_, i) => i !== index),
    }));

  const calculateTotalCost = () =>
    (formData.projectItems || []).reduce(
      (sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.netPrice) || 0)), 0
    );

  // ── Validation ────────────────────────────────────────
  const validateStep = (stepNumber) => {
    const e = {};
    if (stepNumber === 1) {
      if (!formData.plantCode)        e.plantCode        = 'Plant selection is required';
      if (!formData.department)       e.department       = 'Department is required';
      if (!formData.requesterName)    e.requesterName    = 'Requester name is required';
      if (!formData.isPartOfProject)  e.isPartOfProject  = 'Please select an option';
      if (formData.isPartOfProject === 'yes') {
        if (!formData.originalProjectCost) e.originalProjectCost = 'Original project cost is required';
        if (!formData.totalAppropriation)  e.totalAppropriation  = 'Total appropriation is required';
      }
      if (formData.isPartOfProject === 'no') {
        if (!formData.newProjectCost)   e.newProjectCost   = 'New project cost is required';
        if (!formData.standaloneRemark) e.standaloneRemark = 'Remark is required for standalone requests';
      }
    }
    if (stepNumber === 2) {
      if (!formData.projectName)       e.projectName       = 'Project name is required';
      if (!formData.commissioningDate) e.commissioningDate = 'Date of commissioning is required';
      if (!formData.isCapitalBudget)   e.isCapitalBudget   = 'Please select capital budget option';
      if (!Array.isArray(formData.natureOfAsset) || formData.natureOfAsset.length === 0)
        e.natureOfAsset = 'Please select at least one nature of asset';
      if (!Array.isArray(formData.requirementType) || formData.requirementType.length === 0)
        e.requirementType = 'Please select at least one requirement type';
      if (!formData.justification)
        e.justification = 'Justification is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ────────────────────────────────────────
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep))
        setCompletedSteps(prev => [...prev, currentStep]);
      if (currentStep < wizardSteps.length) setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const goToStep = (stepNumber) => {
    if (stepNumber <= currentStep || completedSteps.includes(stepNumber - 1))
      setCurrentStep(stepNumber);
  };

  // ── Transform formData → API payload ─────────────────
  const transformToAPI = (data, status) => {
    const toInt    = (v)     => { const n = parseInt(v, 10);  return Number.isFinite(n) ? n : null; };
    const toFloat  = (v, d=0)=> { const n = parseFloat(v);    return Number.isFinite(n) ? n : d;    };
    const toBin    = (v)     => (v==='yes'||v===true ||v===1||v==='1') ? 1  : (v==='no'||v===false||v===0||v==='0') ? 0  : null;
    const toBinStr = (v)     => (v==='yes'||v===true ||v===1||v==='1') ? '1': (v==='no'||v===false||v===0||v==='0') ? '0': '';

    const isPartYes = data.isPartOfProject === 'yes';

    return {
      plant_code:               toInt(data.plantCode),
      sap_plant_code:           String(data.plantCode        || ''),
      dept:                     String(data.department       || ''),
      requester_name:           String(data.requesterName    || ''),
      budget_category:          String(data.budgetCategory   || 'CAPEX'),
      standalone_remark:        String(data.standaloneRemark || ''),
      project_name:             String(data.projectName      || ''),
      date_comm:                data.commissioningDate ? String(data.commissioningDate) : null,
      ispart_project:           toBin(data.isPartOfProject),
      justification:            String(data.justification    || ''),
      is_capital_budget:        toBinStr(data.isCapitalBudget),
      nature_asset_ids:         Array.isArray(data.natureOfAsset)       ? data.natureOfAsset.join(',')       : '',
      requirement_code:         Array.isArray(data.requirementType)     ? data.requirementType.join(',')     : '',
      esg_ids:                  Array.isArray(data.esgImpactCategories) ? data.esgImpactCategories.join(',') : '',
      esg_impact_details:       String(data.esgImpactDetails || ''),
      new_project_cost:         isPartYes ? 0 : toFloat(data.newProjectCost),
      original_project_cost:    isPartYes ? toFloat(data.originalProjectCost) : 0,
      total_appropriation_cost: isPartYes ? toFloat(data.totalAppropriation)  : 0,
      payback_period:           toFloat(data.paybackPeriod),
      project_irr:              toFloat(data.projectIRR),
      project_items_json:       JSON.stringify(data.projectItems || []),
      c_date:                   initialData?.c_date
                                  ? String(initialData.c_date)
                                  : new Date().toISOString().slice(0, 10),
      submitted_on:             status === 'submitted'
                                  ? (initialData?.submitted_on || new Date().toISOString().slice(0, 10))
                                  : null,
      car_status:               status === 'draft' ? 'Created' : 'Submitted',
    };
  };

  // ── Core save — apiAuth direct (same as dispatch pattern) ──
  /**
   * CREATE:
   *   1. GET /internal/car_number_generator       → { success, car_no: "C1" }
   *   2. POST car_request  { ...payload, car_no }
   *   3. Per item: POST car_item_type { car_no, car_item_id: "CI1", ... }
   *      (item IDs assigned locally CI1, CI2... — no separate endpoint needed)
   *
   * EDIT:
   *   1. PUT  car_request/{nav_id}
   *   2. Per existing item: PUT  car_item_type/{cdb_object_id}
   *      Per new item:      POST car_item_type  with next CI number
   */
  const executeSave = async (status) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const isEditing = !!initialData;
      const payload   = transformToAPI(formData, status);
      const items     = (formData.projectItems || []).filter(
        item => item.description || item.netPrice || item.quantity
      );

      // ── CREATE mode ──────────────────────────────────
      if (!isEditing) {

        // Step 1: GET car_no from backend
        console.log('🔄 Fetching CAR number...');
        const carNoResp = await apiAuth.get(CAR_NUMBER_ENDPOINT);
        const carNoRes  = await carNoResp.json();
        console.log('🔍 car_no response:', carNoRes);

        if (!carNoRes?.success || !carNoRes?.car_no) {
          throw new Error('CAR number generation failed: ' + JSON.stringify(carNoRes));
        }
        const carNo = carNoRes.car_no;
        console.log('🆔 CAR number:', carNo);

        // Step 2: POST car_request
        await addCarRequest({ ...payload, car_no: carNo }).unwrap();
        console.log('✅ car_request saved:', carNo);

        // Step 3: POST each item to car_item_type
        // Item IDs assigned locally: CI1, CI2, CI3...
        for (let i = 0; i < items.length; i++) {
          const item      = items[i];
          const carItemId = `CI${i + 1}`;

          const itemPayload = {
            car_no:           carNo,
            car_item_id:      carItemId,
            description_text: String(item.description || ''),
            source_id:        item.sourceId ? parseInt(item.sourceId, 10) : null,
            is_new:           item.isNew === 'New' ? 1 : 0,
            qty:              parseInt(item.quantity, 10) || 0,
            net_price:        parseFloat(item.netPrice)   || 0,
            remarks:          String(item.remarks || ''),
          };

          await addCarItem(itemPayload).unwrap();
          console.log(`✅ car_item_type saved: ${carItemId}`);
        }

        onSave?.({ ...payload, car_no: carNo });

      // ── EDIT mode ────────────────────────────────────
      } else {
        const carNo = initialData.car_no;
        const navId = initialData.cdb_object_id || initialData.id;

        if (!navId) throw new Error('No navigation ID found for update');

        // Step 1: PUT car_request
        await updateCarRequest({ id: navId, ...payload, car_no: carNo }).unwrap();
        console.log('✅ car_request updated');

        // Step 2: existing items → PUT, new items → POST
        // Count existing CI numbers to assign next available
        const existingCiNums = items
          .filter(it => it.car_item_id)
          .map(it => {
            const m = String(it.car_item_id).match(/\d+$/);
            return m ? parseInt(m[0], 10) : 0;
          });
        let nextCiNum = existingCiNums.length > 0 ? Math.max(...existingCiNums) + 1 : 1;

        for (const item of items) {
          const itemPayload = {
            car_no:           carNo,
            description_text: String(item.description || ''),
            source_id:        item.sourceId ? parseInt(item.sourceId, 10) : null,
            is_new:           item.isNew === 'New' ? 1 : 0,
            qty:              parseInt(item.quantity, 10) || 0,
            net_price:        parseFloat(item.netPrice)   || 0,
            remarks:          String(item.remarks || ''),
          };

          if (item.cdb_object_id) {
            // existing → PUT
            await updateCarItem({
              id: item.cdb_object_id,
              ...itemPayload,
              car_item_id: item.car_item_id,
            }).unwrap();
            console.log(`✅ item updated: ${item.car_item_id}`);
          } else {
            // new item added during edit → POST with next CI number
            const newCarItemId = `CI${nextCiNum++}`;
            await addCarItem({ ...itemPayload, car_item_id: newCarItemId }).unwrap();
            console.log(`✅ new item created: ${newCarItemId}`);
          }
        }

        onSave?.({ ...payload, car_no: carNo });
      }

    } catch (err) {
      console.error('❌ Save error:', err);
      alert('Error saving CAR request: ' + (err?.message || err?.data?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Public handlers ───────────────────────────────────
  const handleSaveDraft = () => executeSave('draft');

  const handleSubmit = () => {
    if (!formData.declaration) {
      alert('Please accept the declaration');
      return;
    }
    if (validateStep(currentStep)) executeSave('submitted');
  };

  // ── Render ────────────────────────────────────────────
  const CurrentStepComponent  = wizardSteps[currentStep - 1].component;
  const completionPercentage  = Math.round((completedSteps.length / wizardSteps.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Capital Asset Request (CAR) Form</h2>
            <p className="text-base text-indigo-100 mt-0.5">
              {initialData ? 'Edit' : 'New'} • Step {currentStep}/{wizardSteps.length}
            </p>
          </div>
          <button onClick={onCancel} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg font-semibold text-gray-600">{completionPercentage}% completed</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Main layout */}
        <div className="flex-1 flex overflow-hidden">

          {/* Sidebar */}
          <div className="w-48 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {wizardSteps.map((step) => {
                const isActive     = currentStep === step.number;
                const isCompleted  = completedSteps.includes(step.number);
                const isAccessible = step.number <= currentStep || completedSteps.includes(step.number - 1);
                return (
                  <button
                    key={step.number}
                    onClick={() => isAccessible && goToStep(step.number)}
                    disabled={!isAccessible}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md scale-105'
                        : isCompleted
                          ? 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold ${
                        isActive ? 'bg-white text-indigo-600'
                        : isCompleted ? 'bg-indigo-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? '✓' : step.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-bold truncate ${
                          isActive ? 'text-white' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>{step.title}</h3>
                        <p className={`text-[10px] truncate mt-0.5 ${
                          isActive ? 'text-indigo-100' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}>{step.subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-gray-200">
              <button className="w-full py-2 px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-lg font-semibold text-gray-700">
                <Phone className="w-4 h-4" /> Support
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="max-w-5xl mx-auto">
                <CurrentStepComponent
                  formData={formData}
                  onUpdateField={handleUpdateField}
                  onToggleArrayItem={handleToggleArrayItem}
                  calculateTotalCost={calculateTotalCost}
                  onAddProjectItem={handleAddProjectItem}
                  onUpdateProjectItem={handleUpdateProjectItem}
                  onRemoveProjectItem={handleRemoveProjectItem}
                  errors={errors}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-base disabled:opacity-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-base disabled:opacity-50 disabled:cursor-wait"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving…' : 'Draft'}
              </button>

              {currentStep < wizardSteps.length ? (
                <button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-bold text-base shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.declaration || isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-base shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  {isSaving ? 'Submitting…' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CarRequestForm;