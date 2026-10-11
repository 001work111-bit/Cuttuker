import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdaptationMethod, ConversionResult, Recommendation, TemplateLibrary } from './types';
import { DEFAULT_LIBRARY, extractStaticLibrary, safeName } from './data/templates';
import {
  chooseRecommended,
  convertTemplate,
  collectFontImports,
  sourceDoc,
} from './algorithms/recompose';
import { Header } from './components/Header';
import { StudioView } from './components/StudioView';
import { Sidebar } from './components/Sidebar';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { ComparativeAudit } from './components/ComparativeAudit';
import { ResearchReport } from './components/ResearchReport';
import { BundlePackage } from './components/BundlePackage';
import { DOMInspectorModal } from './components/DOMInspectorModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'matrix' | 'audit' | 'report' | 'bundle'>('studio');
  const [libraries, setLibraries] = useState<TemplateLibrary[]>([DEFAULT_LIBRARY]);
  const [activeLibId, setActiveLibId] = useState<string>(DEFAULT_LIBRARY.id);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<AdaptationMethod>('smart');
  const [autoConvert, setAutoConvert] = useState<boolean>(true);

  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Готов к работе');
  const [statusTone, setStatusTone] = useState<'good' | 'warn' | ''>('good');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isDOMInspectorOpen, setIsDOMInspectorOpen] = useState<boolean>(false);

  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const activeLib = libraries.find((l) => l.id === activeLibId) || libraries[0] || DEFAULT_LIBRARY;
  const currentTemplate = activeLib.templates[currentIndex] || activeLib.templates[0] || null;

  // Re-run recommendation whenever template changes
  useEffect(() => {
    if (!currentTemplate) return;
    const rec = chooseRecommended(currentTemplate, currentTemplate.html);
    setRecommendation(rec);
    if (autoConvert) {
      setSelectedMethod(rec.method);
    }
  }, [currentTemplate, autoConvert]);

  // Perform live conversion
  const performConversion = useCallback(
    async (methodToUse = selectedMethod) => {
      if (!currentTemplate) return;
      setIsConverting(true);
      setStatusText('Перекомпоновка 16:9 → 9:16…');
      setStatusTone('');

      try {
        const res = await convertTemplate(currentTemplate.html, currentTemplate, methodToUse);
        setConversionResult(res);
        setIsConverting(false);
        setStatusText(res.overflow.length ? 'Предупреждение выхода' : 'Результат готов');
        setStatusTone(res.overflow.length ? 'warn' : 'good');
      } catch (e: any) {
        console.error('Conversion failed:', e);
        setIsConverting(false);
        setStatusText('Ошибка конвертации');
        setStatusTone('warn');
      }
    },
    [currentTemplate, selectedMethod]
  );

  // Trigger conversion on template or method change
  useEffect(() => {
    if (autoConvert && currentTemplate) {
      performConversion(selectedMethod);
    }
  }, [currentIndex, activeLibId, selectedMethod, autoConvert, performConversion]);

  // Method Selection
  const handleSelectMethod = (m: AdaptationMethod) => {
    setSelectedMethod(m);
    if (autoConvert) {
      performConversion(m);
    }
  };

  // Template Selection
  const handleSelectTemplate = (idx: number) => {
    setCurrentIndex(idx);
    const targetTpl = activeLib.templates[idx];
    if (targetTpl) {
      const rec = chooseRecommended(targetTpl, targetTpl.html);
      setRecommendation(rec);
      if (autoConvert) {
        setSelectedMethod(rec.method);
      }
    }
  };

  // File loading handlers
  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => /\.js$/i.test(f.name));
    if (!files.length) return;

    setStatusText('Чтение библиотек…');
    let loadedCount = 0;
    const newLibs: TemplateLibrary[] = [];

    for (const file of files) {
      try {
        const text = await file.text();
        const lib = extractStaticLibrary(text, file.name);
        newLibs.push(lib);
        loadedCount++;
      } catch (err) {
        console.error(`Error loading ${file.name}:`, err);
      }
    }

    if (newLibs.length) {
      setLibraries((prev) => [...newLibs, ...prev]);
      setActiveLibId(newLibs[0].id);
      setCurrentIndex(0);
      setStatusText(`Загружено библиотек: ${loadedCount}`);
      setStatusTone('good');
    } else {
      setStatusText('Ошибка разбора библиотеки JS');
      setStatusTone('warn');
    }
    e.target.value = '';
  };

  // Export handlers
  const handleDownloadOriginal = () => {
    if (!currentTemplate) return;
    const cleanDoc = sourceDoc(currentTemplate.html);
    const blob = new Blob([cleanDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName(currentTemplate.tpl)}_original_16x9.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadConverted = () => {
    if (!currentTemplate || !conversionResult) return;
    let output = conversionResult.outputHtml;
    const fontImports = collectFontImports(currentTemplate.html);
    if (fontImports.length) {
      output = output.replace(
        '</head>',
        `<style id="recompose-font-imports">${fontImports.join('\n')}</style></head>`
      );
    }

    const blob = new Blob([output], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName(currentTemplate.tpl)}_9x16_${selectedMethod}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleOpenTemplateWithMethod = (index: number, method: AdaptationMethod) => {
    setCurrentIndex(index);
    setSelectedMethod(method);
    setActiveTab('studio');
    performConversion(method);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080a0f] text-slate-100 font-sans">
      {/* Hidden file inputs */}
      <input
        ref={filesInputRef}
        type="file"
        multiple
        accept=".js,application/javascript,text/javascript"
        onChange={handleFilesChosen}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        accept=".js,application/javascript,text/javascript"
        onChange={handleFilesChosen}
        className="hidden"
      />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusText={statusText}
        statusTone={statusTone}
        onPickFiles={() => filesInputRef.current?.click()}
        onPickFolder={() => folderInputRef.current?.click()}
        onDownloadConverted={handleDownloadConverted}
        canDownload={Boolean(conversionResult)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {activeTab === 'studio' && (
          <>
            <StudioView
              currentTemplate={currentTemplate}
              conversionResult={conversionResult}
              isConverting={isConverting}
              onDownloadOriginal={handleDownloadOriginal}
              onDownloadConverted={handleDownloadConverted}
              onOpenDOMInspector={() => setIsDOMInspectorOpen(true)}
            />

            <Sidebar
              libraries={libraries}
              activeLibId={activeLibId}
              onSelectLibrary={(id) => {
                setActiveLibId(id);
                setCurrentIndex(0);
              }}
              templates={activeLib.templates}
              currentIndex={currentIndex}
              onSelectTemplate={handleSelectTemplate}
              selectedMethod={selectedMethod}
              onSelectMethod={handleSelectMethod}
              recommendation={recommendation}
              onReconvert={() => performConversion()}
              isConverting={isConverting}
              autoConvert={autoConvert}
              setAutoConvert={setAutoConvert}
              onOpenMatrix={() => setActiveTab('matrix')}
              onPickFiles={() => filesInputRef.current?.click()}
              onPickFolder={() => folderInputRef.current?.click()}
            />
          </>
        )}

        {activeTab === 'matrix' && currentTemplate && (
          <ComparisonMatrix
            currentTemplate={currentTemplate}
            activeMethod={selectedMethod}
            onSelectMethod={handleSelectMethod}
            onBackToStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'audit' && (
          <ComparativeAudit
            templates={activeLib.templates}
            onOpenTemplateWithMethod={handleOpenTemplateWithMethod}
          />
        )}

        {activeTab === 'report' && <ResearchReport />}

        {activeTab === 'bundle' && <BundlePackage templates={activeLib.templates} />}
      </div>

      {/* DOM Inspector Modal */}
      <DOMInspectorModal
        isOpen={isDOMInspectorOpen}
        onClose={() => setIsDOMInspectorOpen(false)}
        currentTemplate={currentTemplate}
        conversionResult={conversionResult}
      />
    </div>
  );
};

export default App;
