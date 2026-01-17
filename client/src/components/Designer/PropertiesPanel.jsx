import { useState, useEffect } from 'react';
import { RotateCw, Move, Palette, Maximize2, Type, Trash2, Copy, FlipHorizontal, FlipVertical, Lock, Unlock, ZoomIn, ZoomOut, Maximize, Eye } from 'lucide-react';

export default function PropertiesPanel({ selectedObject, canvasRef, onDelete, onZoomIn, onZoomOut, onFullscreen }) {
  const [properties, setProperties] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    fill: '#000000',
    locked: false
  });

  // Update properties when object changes or is modified
  useEffect(() => {
    if (selectedObject) {
      updatePropertiesFromObject();

      // Listen for object modifications
      const canvas = canvasRef.current?.getCanvas();
      if (canvas) {
        canvas.on('object:modified', handleObjectModified);
        canvas.on('object:scaling', handleObjectModified);
        canvas.on('object:rotating', handleObjectModified);
        canvas.on('object:moving', handleObjectModified);
      }

      return () => {
        if (canvas) {
          canvas.off('object:modified', handleObjectModified);
          canvas.off('object:scaling', handleObjectModified);
          canvas.off('object:rotating', handleObjectModified);
          canvas.off('object:moving', handleObjectModified);
        }
      };
    }
  }, [selectedObject]);

  const handleObjectModified = () => {
    if (selectedObject) {
      updatePropertiesFromObject();
    }
  };

  const updatePropertiesFromObject = () => {
    if (!selectedObject) return;

    const bounds = selectedObject.getBoundingRect();
    setProperties({
      x: Math.round(selectedObject.left || 0),
      y: Math.round(selectedObject.top || 0),
      width: Math.round(bounds.width || selectedObject.width * (selectedObject.scaleX || 1)),
      height: Math.round(bounds.height || selectedObject.height * (selectedObject.scaleY || 1)),
      angle: Math.round(selectedObject.angle || 0),
      scaleX: selectedObject.scaleX || 1,
      scaleY: selectedObject.scaleY || 1,
      opacity: selectedObject.opacity || 1,
      fill: selectedObject.fill || '#000000',
      locked: selectedObject.lockMovementX && selectedObject.lockMovementY
    });
  };

  const updateObject = (prop, value) => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas || !selectedObject) return;

    selectedObject.set(prop, value);
    canvas.renderAll();
    updatePropertiesFromObject();
  };

  const handleDuplicate = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas || !selectedObject) return;

    selectedObject.clone().then((cloned) => {
      cloned.set({
        left: (selectedObject.left || 0) + 20,
        top: (selectedObject.top || 0) + 20
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  const handleFlipH = () => {
    if (!selectedObject) return;
    updateObject('flipX', !selectedObject.flipX);
  };

  const handleFlipV = () => {
    if (!selectedObject) return;
    updateObject('flipY', !selectedObject.flipY);
  };

  const handleLock = () => {
    if (!selectedObject) return;
    const newLocked = !properties.locked;
    selectedObject.set({
      lockMovementX: newLocked,
      lockMovementY: newLocked,
      lockScalingX: newLocked,
      lockScalingY: newLocked,
      lockRotation: newLocked,
      hasControls: !newLocked,
      selectable: true
    });
    setProperties(prev => ({ ...prev, locked: newLocked }));
    canvasRef.current?.getCanvas()?.renderAll();
  };

  const handleDelete = () => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.renderAll();
    if (onDelete) onDelete();
  };

  // Determine object type for display
  const getObjectType = () => {
    if (!selectedObject) return '';
    if (selectedObject.type === 'i-text' || selectedObject.type === 'text') return 'Text';
    if (selectedObject.type === 'image') return 'Image';
    if (selectedObject.type === 'group') return 'Group';
    return 'Object';
  };

  if (!selectedObject) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Canvas Controls */}
          <div className="p-4 space-y-2">
            <button
              onClick={onFullscreen}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-all"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
              <span>Fullscreen</span>
            </button>
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black rounded-lg text-white font-medium transition-all hover:bg-gray-800"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
          {/* Tips Section */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Tips</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs text-gray-600">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-700 font-bold">1</span>
                </div>
                <p>Click on any element on the canvas to select and edit it</p>
              </div>
              <div className="flex items-start gap-3 text-xs text-gray-600">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-700 font-bold">2</span>
                </div>
                <p>Drag corners to resize, use rotation handle to rotate</p>
              </div>
              <div className="flex items-start gap-3 text-xs text-gray-600">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-700 font-bold">3</span>
                </div>
                <p>Double-click text to edit directly on canvas</p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shortcuts</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Delete element</span>
                <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700 font-mono text-[10px]">Delete</kbd>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Deselect</span>
                <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700 font-mono text-[10px]">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Design Info */}
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Canvas Info</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Print Area</span>
                <span className="text-gray-900">400 × 500 px</span>
              </div>
              <div className="flex justify-between">
                <span>Recommended DPI</span>
                <span className="text-gray-900">300</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isText = selectedObject.type === 'i-text' || selectedObject.type === 'text';

  return (
    <div className="w-64 bg-white border-l border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isText ? (
            <Type className="w-4 h-4 text-black" />
          ) : (
            <Maximize2 className="w-4 h-4 text-black" />
          )}
          <h3 className="text-sm font-semibold text-gray-900">{getObjectType()}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleLock}
            className={`p-1.5 rounded-md transition-colors ${properties.locked ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-400'}`}
            title={properties.locked ? 'Unlock' : 'Lock'}
          >
            {properties.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicate}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-medium text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Transform Section */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Transform</h4>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">X Position</label>
              <input
                type="number"
                value={properties.x}
                onChange={(e) => updateObject('left', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Y Position</label>
              <input
                type="number"
                value={properties.y}
                onChange={(e) => updateObject('top', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Width</label>
              <input
                type="number"
                value={properties.width}
                onChange={(e) => {
                  const newWidth = parseInt(e.target.value) || 1;
                  const scale = newWidth / (selectedObject.width || 1);
                  updateObject('scaleX', scale);
                }}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Height</label>
              <input
                type="number"
                value={properties.height}
                onChange={(e) => {
                  const newHeight = parseInt(e.target.value) || 1;
                  const scale = newHeight / (selectedObject.height || 1);
                  updateObject('scaleY', scale);
                }}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          {/* Rotation */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Rotation
              </label>
              <span className="text-[10px] text-gray-400">{selectedObject?.angle?.toFixed(0) || 0}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedObject?.angle || properties.angle}
              onChange={(e) => updateObject('angle', parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* Flip Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFlipH}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedObject?.flipX ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              Flip H
            </button>
            <button
              onClick={handleFlipV}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedObject?.flipY ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              Flip V
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Appearance</h4>

          {/* Opacity */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-medium text-gray-500">Opacity</label>
              <span className="text-[10px] text-gray-400">{Math.round(properties.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={properties.opacity}
              onChange={(e) => updateObject('opacity', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>

          {/* Color - only for text and shapes */}
          {isText && (
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Palette className="w-3 h-3" />
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={typeof properties.fill === 'string' ? properties.fill : '#000000'}
                  onChange={(e) => updateObject('fill', e.target.value)}
                  className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={typeof properties.fill === 'string' ? properties.fill : '#000000'}
                  onChange={(e) => updateObject('fill', e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          )}
        </div>

        {/* Layer Section */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Layer Order</h4>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => {
                const canvas = canvasRef.current?.getCanvas();
                if (canvas && selectedObject) {
                  canvas.bringObjectToFront(selectedObject);
                  canvas.renderAll();
                }
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-[10px] font-medium text-gray-700 transition-colors"
              title="Bring to Front"
            >
              Front
            </button>
            <button
              onClick={() => {
                const canvas = canvasRef.current?.getCanvas();
                if (canvas && selectedObject) {
                  canvas.bringObjectForward(selectedObject);
                  canvas.renderAll();
                }
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-[10px] font-medium text-gray-700 transition-colors"
              title="Bring Forward"
            >
              Up
            </button>
            <button
              onClick={() => {
                const canvas = canvasRef.current?.getCanvas();
                if (canvas && selectedObject) {
                  canvas.sendObjectBackwards(selectedObject);
                  canvas.renderAll();
                }
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-[10px] font-medium text-gray-700 transition-colors"
              title="Send Backward"
            >
              Down
            </button>
            <button
              onClick={() => {
                const canvas = canvasRef.current?.getCanvas();
                if (canvas && selectedObject) {
                  canvas.sendObjectToBack(selectedObject);
                  canvas.renderAll();
                }
              }}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-[10px] font-medium text-gray-700 transition-colors"
              title="Send to Back"
            >
              Back
            </button>
          </div>
        </div>

        {/* Text Styling Section - Only for text objects */}
        {isText && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Text Settings</h4>

            {/* Letter Spacing */}
            <div className="mb-4">
              <label className="block text-[10px] font-medium text-gray-700 mb-2">
                Letter Spacing: {(selectedObject?.charSpacing || 0) / 10}
              </label>
              <input
                type="range"
                min="-5"
                max="50"
                step="0.5"
                value={(selectedObject?.charSpacing || 0) / 10}
                onChange={(e) => {
                  const spacing = parseFloat(e.target.value);
                  updateObject('charSpacing', spacing * 10);
                }}
                className="w-full"
              />
            </div>

            {/* Line Height */}
            <div className="mb-4">
              <label className="block text-[10px] font-medium text-gray-700 mb-2">
                Line Height: {(selectedObject?.lineHeight || 1.2).toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={selectedObject?.lineHeight || 1.2}
                onChange={(e) => {
                  const height = parseFloat(e.target.value);
                  updateObject('lineHeight', height);
                }}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
