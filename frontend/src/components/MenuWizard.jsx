import { useState } from 'react'
import StepType from './StepType'
import StepContent from './StepContent'
import MenuEditor from './MenuEditor'
import StepStyle from './StepStyle'

const STEPS = [
  { num: 1, label: 'Typ menu' },
  { num: 2, label: 'Treść' },
  { num: 3, label: 'Edycja' },
  { num: 4, label: 'Styl i pobieranie' },
]

export default function MenuWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [menuType, setMenuType] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [rawText, setRawText] = useState('')
  const [menuData, setMenuData] = useState(null)
  const [template, setTemplate] = useState('clean')

  function goNext() {
    setCurrentStep((s) => Math.min(s + 1, 4))
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  function handleTypeSelect(type) {
    setMenuType(type)
    goNext()
  }

  function handleContentDone(data) {
    setMenuData(data)
    goNext()
  }

  function handleEditorConfirm() {
    goNext()
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((step) => (
          <div key={step.num} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                currentStep >= step.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.num}
            </div>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                currentStep >= step.num ? 'text-slate-800' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
            {step.num < 4 && (
              <div
                className={`w-12 h-0.5 ${
                  currentStep > step.num ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {currentStep === 1 && <StepType onSelect={handleTypeSelect} />}
      {currentStep === 2 && (
        <StepContent
          menuType={menuType}
          businessName={businessName}
          setBusinessName={setBusinessName}
          rawText={rawText}
          setRawText={setRawText}
          onDone={handleContentDone}
        />
      )}
      {currentStep === 3 && menuData && (
        <MenuEditor
          menuData={menuData}
          onChange={setMenuData}
          onConfirm={handleEditorConfirm}
        />
      )}
      {currentStep === 4 && (
        <StepStyle
          menuData={menuData}
          template={template}
          setTemplate={setTemplate}
          onEditData={() => setCurrentStep(3)}
        />
      )}

      {/* Navigation */}
      {currentStep > 1 && (
        <div className="mt-8 flex justify-start">
          <button
            onClick={goBack}
            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            ← Wróć
          </button>
        </div>
      )}
    </div>
  )
}
