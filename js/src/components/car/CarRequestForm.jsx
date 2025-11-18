import React, { useState } from 'react';
import { X, CheckCircle, Save, Send, Phone } from 'lucide-react';
import Step1BasicInformation from './Step1BasicInformation';
import Step2ProjectDetails from './Step2ProjectDetails';
import Step3FinancialDetails from './Step3FinancialDetails';
import Step4ReviewSubmit from './Step4ReviewSubmit';

const CarRequestForm = ({ initialData = null, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    plantCode: initialData?.plant_code || '',
    sapPlantCode: initialData?.sap_plant_code || '',
    department: initialData?.dept || '',
    requesterName: initialData?.requester_name || '',
    budgetCategory: 'CAPEX',
    isPartOfProject: initialData
      ? (initialData.ispart_project === 1
        ? 'yes'
        : initialData.ispart_project === 0
          ? 'no'
          : '')
      : '',
    originalProjectCost: initialData?.original_project_cost || '',
    totalAppropriation: initialData?.total_appropriation_cost || '',
    newProjectCost: initialData?.new_project_cost || '',
    standaloneRemark: initialData?.standalone_remark || '',
    projectName: initialData?.project_name || '',
    commissioningDate: initialData?.date_comm || '',
    natureOfAsset: initialData?.nature_of_asset || [],
    requirementType: initialData?.requirement_code
      ? String(initialData.requirement_code).split(',')
      : [],


    justification: initialData?.justification || '',
    paybackPeriod: initialData?.payback_period || '',
    projectIRR: initialData?.project_irr || '',
    projectItems: initialData?.project_items || [],
    standaloneRemark: initialData?.standalone_remark || '',
    esgImpactDetails: initialData?.esg_impact_details || '',
    esgImpactCategories: initialData?.esg_impact_categories || [],
    esgImpactDetails: initialData?.esg_impact_details || '',
    // 🔹 NEW: Capital Budget (yes/no from is_capital_budget 1/0)
    isCapitalBudget: initialData
      ? (initialData.is_capital_budget === 1
        ? 'yes'
        : initialData.is_capital_budget === 0
          ? 'no'
          : '')
      : '',
    declaration: false,
  });

  const [errors, setErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);

  const wizardSteps = [
    { number: 1, title: 'Project Info', subtitle: 'Basic details', component: Step1BasicInformation },
    { number: 2, title: 'Project Details', subtitle: 'Requirements & justification', component: Step2ProjectDetails },
    { number: 3, title: 'Financial Details', subtitle: 'Cost & budget', component: Step3FinancialDetails },
    { number: 4, title: 'Review & Submit', subtitle: 'Final review', component: Step4ReviewSubmit },
  ];

  const handleUpdateField = (field, value) => {
    console.log('📄 Update field:', field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleToggleArrayItem = (arrayField, itemId) => {
  setFormData(prev => {
    const currentArray = (prev[arrayField] || []).map(String);
    const id = String(itemId);

    const newArray = currentArray.includes(id)
      ? currentArray.filter(v => v !== id)
      : [...currentArray, id];

    console.log('✅ New array:', arrayField, newArray);
    return { ...prev, [arrayField]: newArray };
  });
};


  const handleAddProjectItem = () => {
    console.log('➕ Adding project item...');
    const newItem = {
      description: '',
      type: 'Local',
      condition: 'New',
      quantity: 1,
      netPrice: 0
    };
    setFormData(prev => {
      const newItems = [...(prev.projectItems || []), newItem];
      console.log('✅ New items array:', newItems);
      return { ...prev, projectItems: newItems };
    });
  };

  const handleUpdateProjectItem = (index, field, value) => {
    console.log('📄 Update project item:', index, field, value);
    setFormData(prev => {
      const items = [...(prev.projectItems || [])];
      if (items[index]) {
        items[index] = { ...items[index], [field]: value };
      }
      console.log('✅ Updated items:', items);
      return { ...prev, projectItems: items };
    });
  };

  const handleRemoveProjectItem = (index) => {
    console.log('🗑️ Removing project item:', index);
    setFormData(prev => {
      const items = (prev.projectItems || []).filter((_, i) => i !== index);
      console.log('✅ Remaining items:', items);
      return { ...prev, projectItems: items };
    });
  };

  const calculateTotalCost = () => {
    const items = formData.projectItems || [];
    const total = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.netPrice) || 0;
      return sum + (qty * price);
    }, 0);
    console.log('💰 Total cost:', total);
    return total;
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    // STEP 1 – Basic Info
    if (stepNumber === 1) {
      if (!formData.plantCode) newErrors.plantCode = 'Plant selection is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.requesterName) newErrors.requesterName = 'Requester name is required';
      if (!formData.isPartOfProject) newErrors.isPartOfProject = 'Please select an option';

      if (formData.isPartOfProject === 'yes') {
        if (!formData.originalProjectCost) {
          newErrors.originalProjectCost = 'Original project cost is required';
        }
        if (!formData.totalAppropriation) {
          newErrors.totalAppropriation = 'Total appropriation is required';
        }
      }

      if (formData.isPartOfProject === 'no') {
        if (!formData.newProjectCost) {
          newErrors.newProjectCost = 'New project cost is required';
        }
        if (!formData.standaloneRemark) {
          newErrors.standaloneRemark = 'Remark is required for standalone requests';
        }
      }
    }

    // STEP 2 – Project Details (Project Name, Date, Capital Budget, Nature, Requirement, Justification)
    if (stepNumber === 2) {
      if (!formData.projectName) {
        newErrors.projectName = 'Project name is required';
      }

      if (!formData.commissioningDate) {
        newErrors.commissioningDate = 'Date of commissioning is required';
      }

      if (!formData.isCapitalBudget) {
        newErrors.isCapitalBudget = 'Please select capital budget option';
      }

      if (!Array.isArray(formData.natureOfAsset) || formData.natureOfAsset.length === 0) {
        newErrors.natureOfAsset = 'Please select at least one nature of asset';
      }

      if (!Array.isArray(formData.requirementType) || formData.requirementType.length === 0) {
        newErrors.requirementType = 'Please select at least one requirement type';
      }

      if (!formData.justification) {
        newErrors.justification = 'Justification is required';
      }
    }

    // (Optional) STEP 3 – Financial validations agar kuch mandatory rakhna ho
    // if (stepNumber === 3) { ... }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < wizardSteps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const transformToAPI = (data, status) => {
    console.group('📄 TRANSFORM TO API');
    console.log('📥 Input:', data);

    const toInt = (val) => {
      const n = parseInt(val, 10);
      return Number.isFinite(n) ? n : null;
    };

    const toFloat = (val, def = 0) => {
      const n = parseFloat(val);
      return Number.isFinite(n) ? n : def;
    };

    // ------------------------------------------------------------------
    // 1️⃣ Convert yes/no → 1 / 0  (for numeric fields like ispart_project)
    // ------------------------------------------------------------------
    const toBinary = (value) => {
      if (value === 'yes' || value === true || value === 1 || value === '1') return 1;
      if (value === 'no' || value === false || value === 0 || value === '0') return 0;
      return null;
    };

    // ------------------------------------------------------------------
    // 2️⃣ STRING version for fields where backend expects STRING ('1'/'0')
    // ------------------------------------------------------------------
    const toBinaryString = (value) => {
      if (value === 'yes' || value === true || value === 1 || value === '1') return '1';
      if (value === 'no' || value === false || value === 0 || value === '0') return '0';
      return '';
    };

    // ---- COST LOGIC: YES / NO ke hisaab se ----
    let newProjectCostValue = 0;
    let originalProjectCostValue = 0;
    let totalAppropriationValue = 0;

    if (data.isPartOfProject === 'yes') {
      // ✅ YES → Part of existing project
      // UI: Original Project Cost + Total Appropriation
      originalProjectCostValue = toFloat(data.originalProjectCost);
      totalAppropriationValue = toFloat(data.totalAppropriation);
      newProjectCostValue = 0; // YES case me new_project_cost nahi chahiye
    } else if (data.isPartOfProject === 'no') {
      // ✅ NO → Standalone request
      // UI: sirf New Project Cost
      newProjectCostValue = toFloat(data.newProjectCost);
      originalProjectCostValue = 0;
      totalAppropriationValue = 0;
    }


    const payload = {
      plant_code: toInt(data.plantCode),
      sap_plant_code: String(data.plantCode || ''),

      dept: String(data.department || ''),
      requester_name: String(data.requesterName || ''),
      budget_category: String(data.budgetCategory || 'CAPEX'),
      standalone_remark: String(data.standaloneRemark || ''),


      project_name: String(data.projectName || ''),

      date_comm: data.commissioningDate ? String(data.commissioningDate) : null,

      ispart_project: toBinary(data.isPartOfProject),

      justification: String(data.justification || ''),

      // 🔹 NEW: Capital Budget flag to backend (backend expects string '1' / '0')
      is_capital_budget: toBinaryString(data.isCapitalBudget),


      nature_asset_ids: Array.isArray(data.natureOfAsset) ? data.natureOfAsset.join(',') : '',

      // ✅ NEW – store all selected as comma-separated string
      requirement_code: Array.isArray(data.requirementType)
        ? data.requirementType.join(',')
        : '',


      esg_ids: Array.isArray(data.esgImpactCategories) ? data.esgImpactCategories.join(',') : '',
      esg_impact_details: String(data.esgImpactDetails || ''),
      esg_impact_details: String(data.esgImpactDetails || ''),


      new_project_cost: newProjectCostValue,
      original_project_cost: originalProjectCostValue,
      total_appropriation_cost: totalAppropriationValue,

      payback_period: toFloat(data.paybackPeriod),
      project_irr: toFloat(data.projectIRR),
      project_items_json: JSON.stringify(data.projectItems || []),

      standalone_remark: String(data.standaloneRemark || ''),
      car_status: status === 'draft' ? 'Created' : 'Submitted'
    };

    console.log('📤 Output:', payload);
    console.groupEnd();
    return payload;
  };

  const handleSaveDraft = () => {
    const payload = transformToAPI(formData, 'draft');
    console.log('💾 Saving draft...');
    onSave(payload);
  };

  const handleSubmit = () => {
    if (!formData.declaration) {
      alert('Please accept the declaration');
      return;
    }
    if (validateStep(currentStep)) {
      const payload = transformToAPI(formData, 'submitted');
      console.log('📤 Submitting...');
      onSave(payload);
    }
  };

  const goToStep = (stepNumber) => {
    if (stepNumber <= currentStep || completedSteps.includes(stepNumber - 1)) {
      setCurrentStep(stepNumber);
    }
  };

  const CurrentStepComponent = wizardSteps[currentStep - 1].component;
  const completionPercentage = Math.round((completedSteps.length / wizardSteps.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Main Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header - Gradient */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Capital Asset Request (CAR) Form</h2>
            <p className="text-base text-indigo-100 mt-0.5">{initialData ? 'Edit' : 'New'} • Step {currentStep}/{wizardSteps.length}</p>
          </div>
          <button onClick={onCancel} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600">{completionPercentage}% completed</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        {/* Main Content Area - Flex Row */}
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT SIDEBAR - NARROW (192px) */}
          <div className="w-48 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {wizardSteps.map((step) => {
                const isActive = currentStep === step.number;
                const isCompleted = completedSteps.includes(step.number);
                const isAccessible = step.number <= currentStep || completedSteps.includes(step.number - 1);

                return (
                  <button
                    key={step.number}
                    onClick={() => isAccessible && goToStep(step.number)}
                    disabled={!isAccessible}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : isCompleted
                        ? 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      {/* Step Number Badge */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive
                        ? 'bg-white text-indigo-600'
                        : isCompleted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                        }`}>
                        {isCompleted ? '✓' : step.number}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xs font-bold truncate ${isActive ? 'text-white' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                          {step.title}
                        </h3>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-indigo-100' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Support Button */}
            <div className="p-3 border-t border-gray-200">
              <button className="w-full py-2 px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
                <Phone className="w-4 h-4" />
                Support
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT AREA - WIDER WITH LIGHT GRADIENT BACKGROUND */}
          <div className="flex-1 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 overflow-hidden flex flex-col">
            {/* Step Content - Scrollable */}
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

        {/* Footer Actions */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Previous Button */}
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-base"
                >
                  Previous
                </button>
              )}
            </div>

            {/* Right - Draft & Next/Submit Buttons */}
            <div className="flex items-center gap-3">
              {/* Save Draft Button */}
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-base"
              >
                <Save className="w-4 h-4" />
                Draft
              </button>

              {/* Next or Submit Button */}
              {currentStep < wizardSteps.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all font-bold text-base shadow-md hover:shadow-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!formData.declaration}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-base shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Submit
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