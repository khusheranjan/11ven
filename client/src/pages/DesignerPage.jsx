import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Type, Upload, ChevronRight,
  ZoomIn, ZoomOut, Maximize, Eye
} from 'lucide-react';
import Canvas from '../components/Designer/Canvas';
import AssetLibrary from '../components/Designer/AssetLibrary';
import Toolbar from '../components/Designer/Toolbar';
import PropertiesPanel from '../components/Designer/PropertiesPanel';
import { saveDesign } from '../services/api';

export default function DesignerPage() {
  const canvasRef = useRef(null);
  const [tshirtColor, setTshirtColor] = useState('#ffffff');
  const [saving, setSaving] = useState(false);
  const [activeTool, setActiveTool] = useState('graphics');
  const [selectedObject, setSelectedObject] = useState(null);
  const [side, setSide] = useState('front');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasContainerRef = useRef(null);
  const navigate = useNavigate();

  // Zoom functions
  const handleZoomIn = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      const newZoom = Math.min(zoomLevel + 0.2, 3);
      setZoomLevel(newZoom);
      canvas.setZoom(newZoom);
      canvas.renderAll();
    }
  };

  const handleZoomOut = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (canvas) {
      const newZoom = Math.max(zoomLevel - 0.2, 0.5);
      setZoomLevel(newZoom);
      canvas.setZoom(newZoom);
      canvas.renderAll();
    }
  };

  const handleFullscreen = () => {
    if (canvasContainerRef.current) {
      if (!document.fullscreenElement) {
        canvasContainerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(err => console.log(err));
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Handle side change
  const handleSideChange = (newSide) => {
    setSide(newSide);
    // The Canvas component handles the actual side switching internally
  };

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

  const tools = [
    { id: 'graphics', icon: LayoutGrid, label: 'ART' },
    { id: 'text', icon: Type, label: 'TEXT' },
    { id: 'upload', icon: Upload, label: 'UPLOAD' },
  ];

  const colors = [
    { value: '#ffffff', label: 'White', ring: 'ring-gray-300' },
    { value: '#000000', label: 'Black', ring: 'ring-black' },
    { value: '#2563eb', label: 'Blue', ring: 'ring-blue-600' },
    { value: '#dc2626', label: 'Red', ring: 'ring-red-600' },
    { value: '#16a34a', label: 'Green', ring: 'ring-green-600' },
    { value: '#f59e0b', label: 'Yellow', ring: 'ring-yellow-600' },
    { value: '#ec4899', label: 'Pink', ring: 'ring-pink-600' },
    { value: '#8b5cf6', label: 'Purple', ring: 'ring-purple-600' },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-gray-900 antialiased bg-slate-50">
      {/* Sidebar - Fixed width with equal size tabs */}
      <aside className="w-20 bg-white/80 backdrop-blur-sm border-r border-gray-100 flex flex-col items-center py-6 space-y-4 h-screen overflow-y-auto">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-16 h-16 flex flex-col items-center justify-center group transition-all duration-200 ${
              activeTool === tool.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-3 rounded-xl mb-1 transition-all ${
              activeTool === tool.id ? 'bg-blue-50' : 'group-hover:bg-gray-50'
            }`}>
              <tool.icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-wider">{tool.label}</span>
          </button>
        ))}
      </aside>

      {/* Tool Panel */}
      <div className="flex-shrink-0">
        {activeTool === 'graphics' && (
          <AssetLibrary onSelectAsset={handleSelectAsset} />
        )}
        {activeTool === 'text' && (
          <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-100 h-screen flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Text</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <Toolbar
                canvasRef={canvasRef}
                showOnlyText={true}
                selectedObject={selectedObject}
                tshirtColor={tshirtColor}
              />
            </div>
          </div>
        )}
        {activeTool === 'upload' && (
          <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-gray-100 h-screen flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Upload</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <Toolbar canvasRef={canvasRef} showOnlyUpload={true} />
            </div>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden" ref={canvasContainerRef}>
        {/* Top Controls */}
        <div className="p-6 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Custom T-Shirt Design</h1>
            <p className="text-sm text-gray-500 font-medium">Premium Quality • High-Resolution Print</p>
          </div>

          <div className="flex items-center space-x-6">
            {/* Front/Back Toggle */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
              <button
                onClick={() => handleSideChange('front')}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                  side === 'front' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => handleSideChange('back')}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                  side === 'back' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Back
              </button>
            </div>

            {/* Color Selector */}
            <div className="flex space-x-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setTshirtColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    tshirtColor === c.value ? 'ring-2 ring-offset-2 ' + c.ring : 'border-white shadow-sm'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center shadow-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Checkout'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Canvas with Dot Grid Background */}
        <div className="flex-1 dot-grid relative flex items-center justify-center">
          <div className="relative w-full max-w-2xl px-12">
            <Canvas
              ref={canvasRef}
              tshirtColor={tshirtColor}
              setTshirtColor={setTshirtColor}
              onSelectionChange={setSelectedObject}
              side={side}
              onSideChange={handleSideChange}
              hideControls={true}
            />
          </div>

          {/* Floating Zoom Controls */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col space-y-3">
            <button
              onClick={handleZoomIn}
              className="p-3 bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all text-gray-500 hover:text-blue-600"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-3 bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all text-gray-500 hover:text-blue-600"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-3 bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all text-gray-500 hover:text-blue-600"
              title="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Preview Button Only */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-white/90 backdrop-blur px-2 py-2 rounded-2xl shadow-xl border border-gray-100">
            <button className="flex items-center space-x-2 px-6 py-3 hover:bg-gray-100 rounded-xl transition-all group">
              <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Properties Panel */}
      <PropertiesPanel
        selectedObject={selectedObject}
        canvasRef={canvasRef}
        onDelete={() => setSelectedObject(null)}
      />
    </div>
  );
}
