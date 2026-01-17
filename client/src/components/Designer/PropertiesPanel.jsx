import { useState, useEffect } from 'react';
import { RotateCw, Move, Palette, Maximize2, Type, Trash2, Copy, FlipHorizontal, FlipVertical, Lock, Unlock } from 'lucide-react';

export default function PropertiesPanel({ selectedObject, canvasRef, onDelete }) {
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
      <div className="w-64 bg-white/80 backdrop-blur-sm border-l border-gray-100 h-full flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-400">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Move className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No Selection</p>
            <p className="text-xs text-gray-400 mt-1">Select an element to edit</p>
          </div>
        </div>
      </div>
    );
  }

  const isText = selectedObject.type === 'i-text' || selectedObject.type === 'text';

  return (
    <div className="w-64 bg-white/95 backdrop-blur-sm border-l border-gray-100 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isText ? (
            <Type className="w-4 h-4 text-blue-500" />
          ) : (
            <Maximize2 className="w-4 h-4 text-blue-500" />
          )}
          <h3 className="text-sm font-semibold text-gray-900">{getObjectType()}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleLock}
            className={`p-1.5 rounded-md transition-colors ${properties.locked ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100 text-gray-400'}`}
            title={properties.locked ? 'Unlock' : 'Lock'}
          >
            {properties.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicate}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors"
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
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Transform</h4>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">X Position</label>
              <input
                type="number"
                value={properties.x}
                onChange={(e) => updateObject('left', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Y Position</label>
              <input
                type="number"
                value={properties.y}
                onChange={(e) => updateObject('top', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
              <span className="text-[10px] text-gray-400">{properties.angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={properties.angle}
              onChange={(e) => updateObject('angle', parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Flip Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFlipH}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedObject?.flipX ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              Flip H
            </button>
            <button
              onClick={handleFlipV}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedObject?.flipY ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              Flip V
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="p-4 border-b border-gray-100">
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
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
                  className="w-8 h-8 rounded-md border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={typeof properties.fill === 'string' ? properties.fill : '#000000'}
                  onChange={(e) => updateObject('fill', e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Layer Section */}
        <div className="p-4">
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
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-[10px] font-medium text-gray-700 transition-colors"
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
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-[10px] font-medium text-gray-700 transition-colors"
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
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-[10px] font-medium text-gray-700 transition-colors"
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
      </div>
    </div>
  );
}
