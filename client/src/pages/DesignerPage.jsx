import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Canvas from '../components/Designer/Canvas';
import AssetLibrary from '../components/Designer/AssetLibrary';
import Toolbar from '../components/Designer/Toolbar';
import { saveDesign } from '../services/api';

export default function DesignerPage() {
  const canvasRef = useRef(null);
  const [tshirtColor, setTshirtColor] = useState('#ffffff');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('graphics'); // 'upload', 'text', 'graphics'
  const [selectedObject, setSelectedObject] = useState(null);
  const navigate = useNavigate();

  const handleSelectAsset = (asset) => {
    if (canvasRef.current) {
      canvasRef.current.addImage(asset.imageUrl);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current.getCanvas();
    if (!canvas || canvas.getObjects().length === 0) {
      alert('Please add at least one element to your design');
      return;
    }

    setSaving(true);
    try {
      const design = await saveDesign({
        canvasJSON: canvasRef.current.getCanvasJSON(),
        tshirtColor,
        mockupData: canvasRef.current.exportMockup(),
        printData: canvasRef.current.exportPrint()
      });
      navigate(`/checkout/${design.data._id}`);
    } catch (err) {
      console.error('Failed to save design:', err);
      alert('Failed to save design. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'text', label: 'Add text', icon: 'T' },
    { id: 'graphics', label: 'Graphics', icon: '🎨' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Design Your T-Shirt</h1>
            <button
              onClick={handleProceedToCheckout}
              disabled={saving}
              className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {saving ? 'Saving...' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar with Tabs */}
        <div className="w-20 bg-gray-800 flex flex-col items-center py-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={tab.label}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
            </button>
          ))}
        </div>

        {/* Content Panel (opens based on active tab) */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          {activeTab === 'upload' && (
            <div className="h-full">
              <Toolbar canvasRef={canvasRef} showOnlyUpload={true} />
            </div>
          )}

          {activeTab === 'text' && (
            <div className="h-full">
              <h3 className="text-lg font-semibold p-4 pb-0">Add Text</h3>
              <Toolbar
                canvasRef={canvasRef}
                showOnlyText={true}
                selectedObject={selectedObject}
                tshirtColor={tshirtColor}
              />
            </div>
          )}

          {activeTab === 'graphics' && (
            <AssetLibrary onSelectAsset={handleSelectAsset} />
          )}
        </div>

        {/* Canvas - Center (takes remaining space) */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-8 overflow-auto">
          <div className="w-full max-w-3xl">
            <Canvas
              ref={canvasRef}
              tshirtColor={tshirtColor}
              setTshirtColor={setTshirtColor}
              onSelectionChange={setSelectedObject}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
