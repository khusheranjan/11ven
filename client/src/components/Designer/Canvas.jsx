import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as fabric from 'fabric';

const TSHIRT_COLORS = [
  { name: 'White', value: '#ffffff', hex: '#FFFFFF', frontImage: '/tshirt-white-front.png', backImage: '/tshirt-white-back.png' },
  { name: 'Black', value: '#1a1a1a', hex: '#1A1A1A', frontImage: '/tshirt-black-front.png', backImage: '/tshirt-black-back.png' },
  { name: 'Navy', value: '#1e3a5f', hex: '#1E3A5F', frontImage: '/tshirt-navy-front.png', backImage: '/tshirt-navy-back.png' },
  { name: 'Red', value: '#dc2626', hex: '#DC2626', frontImage: '/tshirt-red-front.png', backImage: '/tshirt-red-back.png' },
  { name: 'Green', value: '#16a34a', hex: '#16A34A', frontImage: '/tshirt-green-front.png', backImage: '/tshirt-green-back.png' },
  { name: 'Gray', value: '#6b7280', hex: '#6B7280', frontImage: '/tshirt-gray-front.png', backImage: '/tshirt-gray-back.png' },
  { name: 'Yellow', value: '#eab308', hex: '#EAB308', frontImage: '/tshirt-yellow-front.png', backImage: '/tshirt-yellow-back.png' },
  { name: 'Pink', value: '#ec4899', hex: '#EC4899', frontImage: '/tshirt-pink-front.png', backImage: '/tshirt-pink-back.png' },
];

const Canvas = forwardRef(({ onCanvasReady, tshirtColor, setTshirtColor, onSelectionChange, side: externalSide, onSideChange, hideControls = false }, ref) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [internalSide, setInternalSide] = useState('front');
  const [frontDesign, setFrontDesign] = useState(null);
  const [backDesign, setBackDesign] = useState(null);

  // Use external side if provided, otherwise use internal
  const side = externalSide !== undefined ? externalSide : internalSide;
  const setSide = onSideChange || setInternalSide;

  useImperativeHandle(ref, () => ({
    addImage: (url) => {
      if (!fabricRef.current) return;
      fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
        img.scaleToWidth(150);
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
      });
    },
    addText: (text) => {
      if (!fabricRef.current) return;
      const textObj = new fabric.IText(text, {
        left: 100,
        top: 100,
        fontSize: 32,
        fill: tshirtColor === '#ffffff' ? '#000000' : '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold'
      });
      fabricRef.current.add(textObj);
      fabricRef.current.setActiveObject(textObj);
      fabricRef.current.renderAll();
    },
    deleteSelected: () => {
      if (!fabricRef.current) return;
      const active = fabricRef.current.getActiveObject();
      if (active) {
        fabricRef.current.remove(active);
        fabricRef.current.renderAll();
      }
    },
    getCanvasJSON: () => {
      if (!fabricRef.current) return null;
      // Save current canvas state before exporting
      saveCurrentSide();
      return {
        front: frontDesign || fabricRef.current.toJSON(),
        back: backDesign
      };
    },
    loadFromJSON: (json) => {
      if (!fabricRef.current || !json) return;
      if (json.front) {
        setFrontDesign(json.front);
        setBackDesign(json.back || null);
        fabricRef.current.loadFromJSON(json.front).then(() => {
          fabricRef.current.renderAll();
        });
      } else {
        // Backward compatibility
        fabricRef.current.loadFromJSON(json).then(() => {
          fabricRef.current.renderAll();
        });
      }
    },
    exportMockup: () => {
      if (!fabricRef.current) return null;
      return fabricRef.current.toDataURL({ format: 'png', quality: 1 });
    },
    exportPrint: () => {
      if (!fabricRef.current) return null;
      return fabricRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 3
      });
    },
    getCanvas: () => fabricRef.current
  }));

  // Save current canvas state when switching sides
  const saveCurrentSide = () => {
    if (!fabricRef.current) return;
    const json = fabricRef.current.toJSON();
    if (side === 'front') {
      setFrontDesign(json);
    } else {
      setBackDesign(json);
    }
  };

  // Load design when switching sides
  const handleSideChange = (newSide) => {
    if (newSide === side) return;

    // Save current side's design
    saveCurrentSide();

    // Switch side
    setSide(newSide);

    // Load the other side's design
    const designToLoad = newSide === 'front' ? frontDesign : backDesign;
    if (designToLoad && fabricRef.current) {
      fabricRef.current.loadFromJSON(designToLoad).then(() => {
        fabricRef.current.renderAll();
      });
    } else if (fabricRef.current) {
      // Clear canvas if no design exists for this side
      fabricRef.current.clear();
      fabricRef.current.backgroundColor = 'transparent';
    }
  };

  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 500,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
        // Modern selection styling
        selectionColor: 'rgba(59, 130, 246, 0.1)',
        selectionBorderColor: '#3b82f6',
        selectionLineWidth: 1
      });

      // Customize default control styling for all objects
      fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: '#3b82f6',
        cornerStrokeColor: '#ffffff',
        cornerSize: 8,
        cornerStyle: 'circle',
        borderColor: '#3b82f6',
        borderScaleFactor: 1.5,
        padding: 8,
        borderDashArray: [4, 4]
      });

      // Add selection change handler
      fabricRef.current.on('selection:created', (e) => {
        if (onSelectionChange) {
          onSelectionChange(e.selected[0]);
        }
      });

      fabricRef.current.on('selection:updated', (e) => {
        if (onSelectionChange) {
          onSelectionChange(e.selected[0]);
        }
      });

      fabricRef.current.on('selection:cleared', () => {
        if (onSelectionChange) {
          onSelectionChange(null);
        }
      });

      // Add delete key handler
      document.addEventListener('keydown', handleKeyDown);

      if (onCanvasReady) {
        onCanvasReady(fabricRef.current);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (fabricRef.current && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        const active = fabricRef.current.getActiveObject();
        if (active && !active.isEditing) {
          fabricRef.current.remove(active);
          fabricRef.current.renderAll();
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Canvas with T-shirt mockup */}
      <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-2xl shadow-2xl p-10">
        <div className="relative w-[400px] h-[500px] flex items-center justify-center">
          {/* T-shirt Image Mockup */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center"
            style={{ zIndex: 1 }}
          >
            <img
              src={
                TSHIRT_COLORS.find(c => c.value === tshirtColor)?.[side === 'front' ? 'frontImage' : 'backImage'] ||
                '/tshirt-white-front.png'
              }
              alt="T-shirt"
              className="w-full h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>

          {/* Design canvas - positioned in print area */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              zIndex: 2,
              marginTop: '30px'
            }}
          >
            {/* Canvas border for visibility */}
            <div className="relative">
              <div className="absolute -inset-2 border-2 border-dashed border-blue-200 rounded-lg pointer-events-none opacity-50"></div>
              <canvas ref={canvasRef} className="relative" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
