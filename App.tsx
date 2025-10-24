import React, { useState, useCallback, useMemo } from 'react';
import type { ShiftData } from './types';
import { Shift } from './types';
import DataEntryForm from './components/DataEntryForm';
import DataTable from './components/DataTable';
import PerformanceCharts from './components/PerformanceCharts';
import AnalysisCard from './components/AnalysisCard';
import Chatbot from './components/Chatbot';
import { analyzeProductionData } from './services/geminiService';
import { HeaderIcon, AnalyzeIcon, CalendarIcon, CloseIcon, ChatIcon } from './components/icons';

const EditModal: React.FC<{
  record: ShiftData;
  onSave: (record: ShiftData) => void;
  onCancel: () => void;
}> = ({ record, onSave, onCancel }) => {
    const [date, setDate] = useState<string>(record.date);
    const [shift, setShift] = useState<Shift>(record.shift);
    const [unitsProduced, setUnitsProduced] = useState<string>(record.unitsProduced.toString());
    const [unitsScrapped, setUnitsScrapped] = useState<string>(record.unitsScrapped.toString());
    const [error, setError] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const produced = parseInt(unitsProduced, 10);
        const scrapped = parseInt(unitsScrapped, 10);

        if (!date || isNaN(produced) || isNaN(scrapped) || produced <= 0) {
            setError('Please fill all fields with valid numbers. Units Produced must be greater than 0.');
            return;
        }
        if (scrapped > produced) {
            setError('Units scrapped cannot be greater than units produced.');
            return;
        }
        if (scrapped < 0) {
            setError('Units scrapped cannot be negative.');
            return;
        }

        setError('');
        onSave({
            ...record,
            date,
            shift,
            unitsProduced: produced,
            unitsScrapped: scrapped,
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Shift Record</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <CloseIcon />
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon /></div>
                            <input
                            type="date" id="edit-date" value={date} onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200" required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="edit-shift" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shift</label>
                        <select
                            id="edit-shift" value={shift} onChange={(e) => setShift(e.target.value as Shift)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        >
                            {Object.values(Shift).map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="edit-unitsProduced" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Units Produced</label>
                        <input
                            type="number" id="edit-unitsProduced" value={unitsProduced} onChange={(e) => setUnitsProduced(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            min="1" required
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-unitsScrapped" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Units Scrapped</label>
                        <input
                            type="number" id="edit-unitsScrapped" value={unitsScrapped} onChange={(e) => setUnitsScrapped(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            min="0" required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">Cancel</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [shiftData, setShiftData] = useState<ShiftData[]>([
    { id: 1, date: '2023-10-01', shift: Shift.A, unitsProduced: 500, unitsScrapped: 25 },
    { id: 2, date: '2023-10-01', shift: Shift.B, unitsProduced: 480, unitsScrapped: 35 },
    { id: 3, date: '2023-10-01', shift: Shift.C, unitsProduced: 450, unitsScrapped: 20 },
    { id: 4, date: '2023-10-02', shift: Shift.A, unitsProduced: 510, unitsScrapped: 22 },
    { id: 5, date: '2023-10-02', shift: Shift.B, unitsProduced: 470, unitsScrapped: 40 },
    { id: 6, date: '2023-10-02', shift: Shift.C, unitsProduced: 460, unitsScrapped: 28 },
    { id: 7, date: '2023-10-03', shift: Shift.A, unitsProduced: 520, unitsScrapped: 24 },
    { id: 8, date: '2023-10-03', shift: Shift.B, unitsProduced: 490, unitsScrapped: 45 },
    { id: 9, date: '2023-10-03', shift: Shift.C, unitsProduced: 440, unitsScrapped: 30 },
  ]);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<ShiftData | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);


  const handleAddData = useCallback((newData: Omit<ShiftData, 'id'>) => {
    setShiftData(prevData => [
      ...prevData,
      { ...newData, id: prevData.length > 0 ? Math.max(...prevData.map(d => d.id)) + 1 : 1 }
    ]);
  }, []);

  const handleUpdateData = useCallback((updatedRecord: ShiftData) => {
    setShiftData(prevData => prevData.map(d => d.id === updatedRecord.id ? updatedRecord : d));
    setEditingRecord(null);
  }, []);

  const handleDeleteData = useCallback((idToDelete: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
        setShiftData(prevData => prevData.filter(d => d.id !== idToDelete));
    }
  }, []);

  const handleClearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all production data? This action cannot be undone.')) {
        setShiftData([]);
        setAnalysis('');
    }
  }, []);
  
  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis('');
    try {
      const result = await analyzeProductionData(shiftData);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [shiftData]);
  
  const sortedShiftData = useMemo(() => {
    return [...shiftData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id);
  }, [shiftData]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HeaderIcon />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Manufacturing Performance Tracker
              </h1>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <DataEntryForm onSubmit={handleAddData} />
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">AI-Powered Analysis</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Get instant feedback on your production data. Our AI will analyze trends, identify KPIs, and provide actionable recommendations.
                  </p>
                  <button
                      onClick={handleAnalyze}
                      disabled={isLoading || shiftData.length === 0}
                      className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  >
                      <AnalyzeIcon />
                      <span className="ml-2">{isLoading ? 'Analyzing...' : 'Analyze Performance'}</span>
                  </button>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              <AnalysisCard analysis={analysis} isLoading={isLoading} error={error} />
              <PerformanceCharts data={sortedShiftData} />
              <DataTable
                  data={sortedShiftData}
                  onEdit={setEditingRecord}
                  onDelete={handleDeleteData}
                  onClearAll={handleClearAllData}
              />
            </div>
          </div>
        </main>
        {editingRecord && (
          <EditModal 
              record={editingRecord}
              onSave={handleUpdateData}
              onCancel={() => setEditingRecord(null)}
          />
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button
            onClick={() => setIsChatbotOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110"
            aria-label="Open AI Chatbot"
            disabled={shiftData.length === 0}
        >
            <ChatIcon />
        </button>
      </div>

      <Chatbot
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          data={shiftData}
      />
    </>
  );
};

export default App;