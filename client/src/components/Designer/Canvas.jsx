import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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

const Canvas = forwardRef(({ onCanvasReady, tshirtColor, onSelectionChange, side = 'front', zoomLevel = 1 }, ref) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const frontDesignRef = useRef(null);
  const backDesignRef = useRef(null);
  const previousSideRef = useRef('front');

  // Save current canvas state to the appropriate side ref
  const saveCurrentSide = (currentSide) => {
    if (!fabricRef.current) return;
    const json = fabricRef.current.toJSON();
    if (currentSide === 'front') {
      frontDesignRef.current = json;
    } else {
      backDesignRef.current = json;
    }
  };

  // Load design for the specified side
  const loadSideDesign = (targetSide) => {
    if (!fabricRef.current) return;

    const designToLoad = targetSide === 'front' ? frontDesignRef.current : backDesignRef.current;

    // Clear canvas first
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = 'transparent';

    if (designToLoad) {
      fabricRef.current.loadFromJSON(designToLoad).then(() => {
        fabricRef.current.renderAll();
      });
    }
  };

  // Watch for side changes from external prop
  useEffect(() => {
    if (!fabricRef.current) return;

    const prevSide = previousSideRef.current;

    if (prevSide !== side) {
      // Save the design from the previous side
      saveCurrentSide(prevSide);

      // Load the design for the new side
      loadSideDesign(side);

      // Update previous side ref
      previousSideRef.current = side;

      // Clear selection when switching sides
      if (onSelectionChange) {
        onSelectionChange(null);
      }
    }
  }, [side]);

  useImperativeHandle(ref, () => ({
    addImage: (url) => {
      if (!fabricRef.current) return;
      fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
        img.scaleToWidth(150);
        // Position at canvas center
        img.set({
          left: 200,
          top: 250,
          originX: 'center',
          originY: 'center'
        });
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
      });
    },
    addText: (text) => {
      if (!fabricRef.current) return;
      const textObj = new fabric.IText(text, {
        left: 200,
        top: 250,
        fontSize: 32,
        fill: tshirtColor === '#ffffff' ? '#000000' : '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        originX: 'center',
        originY: 'center'
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
      saveCurrentSide(side);
      return {
        front: frontDesignRef.current || fabricRef.current.toJSON(),
        back: backDesignRef.current
      };
    },
    loadFromJSON: (json) => {
      if (!fabricRef.current || !json) return;
      if (json.front) {
        frontDesignRef.current = json.front;
        backDesignRef.current = json.back || null;
        // Load the current side's design
        const designToLoad = side === 'front' ? json.front : json.back;
        if (designToLoad) {
          fabricRef.current.loadFromJSON(designToLoad).then(() => {
            fabricRef.current.renderAll();
          });
        }
      } else {
        // Backward compatibility - load as front design
        frontDesignRef.current = json;
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
    getCanvas: () => fabricRef.current,
    getCurrentSide: () => side,
    getFrontDesign: () => frontDesignRef.current,
    getBackDesign: () => backDesignRef.current,
    // Export mockup for a specific side
    exportSideMockup: async (targetSide) => {
      if (!fabricRef.current) return null;

      // Save current state
      const currentSideDesign = fabricRef.current.toJSON();

      // If requesting current side, just export
      if (targetSide === side) {
        return fabricRef.current.toDataURL({ format: 'png', quality: 1 });
      }

      // Otherwise, we need to load the other side's design, export, then restore
      const designToLoad = targetSide === 'front' ? frontDesignRef.current : backDesignRef.current;

      if (!designToLoad || !designToLoad.objects || designToLoad.objects.length === 0) {
        return null; // No design on that side
      }

      // Load the target side design
      await fabricRef.current.loadFromJSON(designToLoad);
      fabricRef.current.renderAll();

      // Export
      const mockup = fabricRef.current.toDataURL({ format: 'png', quality: 1 });

      // Restore current side
      await fabricRef.current.loadFromJSON(currentSideDesign);
      fabricRef.current.renderAll();

      return mockup;
    },
    // Check if there's content on a specific side
    hasSideContent: (targetSide) => {
      const design = targetSide === 'front' ? frontDesignRef.current : backDesignRef.current;

      // If checking current side, check canvas directly
      if (targetSide === side && fabricRef.current) {
        return fabricRef.current.getObjects().length > 0;
      }

      return design && design.objects && design.objects.length > 0;
    },
    // Check if design has content on back
    hasBackContent: () => {
      // If currently on back, check canvas
      if (side === 'back' && fabricRef.current) {
        return fabricRef.current.getObjects().length > 0;
      }
      // Otherwise check saved back design
      return backDesignRef.current && backDesignRef.current.objects && backDesignRef.current.objects.length > 0;
    }
  }));

  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 500,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
        // Modern selection styling
        selectionColor: 'rgba(220, 38, 38, 0.1)',
        selectionBorderColor: '#dc2626',
        selectionLineWidth: 1
      });

      // Customize default control styling for all objects
      fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: '#dc2626',
        cornerStrokeColor: '#ffffff',
        cornerSize: 6,
        borderColor: '#dc2626',
        borderScaleFactor: 1,
        padding: 8,
        borderDashArray: [4, 4],
        centeredRotation: true,
        originX: 'center',
        originY: 'center'
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
      <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-2xl shadow-2xl p-10 origin-center transition-transform" style={{ transform: `scale(${zoomLevel})` }}>
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
