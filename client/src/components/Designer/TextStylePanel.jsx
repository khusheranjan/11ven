import { useState, useEffect } from 'react';
import * as fabric from 'fabric';

// Popular Google Fonts organized by category
const FONT_CATEGORIES = {
  funky: [
    'Bungee',
    'Monoton',
    'Fredoka One',
    'Fascinate',
    'Rubik Mono One',
    'Creepster',
    'Rammetto One',
    'Black Ops One',
    'Press Start 2P',
    'Audiowide',
    'Orbitron',
    'Bangers',
    'Abril Fatface',
    'Alfa Slab One',
    'Bungee Shade'
  ],
  display: [
    'Bebas Neue',
    'Oswald',
    'Righteous',
    'Archivo Black',
    'Fredoka One',
    'Lobster',
    'Pacifico',
    'Permanent Marker'
  ],
  handwriting: [
    'Caveat',
    'Dancing Script',
    'Pacifico',
    'Satisfy',
    'Cookie',
    'Great Vibes',
    'Kaushan Script',
    'Allura'
  ],
  monospace: [
    'Roboto Mono',
    'Source Code Pro',
    'Courier Prime',
    'Space Mono',
    'IBM Plex Mono',
    'Fira Code',
    'JetBrains Mono',
    'Ubuntu Mono'
  ],
  serif: [
    'Playfair Display',
    'Merriweather',
    'Lora',
    'Crimson Text',
    'EB Garamond',
    'Libre Baskerville',
    'Cormorant',
    'Cinzel'
  ],
  sansSerif: [
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Raleway',
    'Poppins',
    'Inter',
    'Nunito'
  ]
};

// Text effect presets with visual styling
const TEXT_EFFECTS = [
  { id: 'none', name: 'Normal' },
  { id: 'curved', name: 'Curved' },
  { id: 'shadow', name: 'Shadow' },
  { id: 'outline', name: 'Outline' }
];

export default function TextStylePanel({ canvasRef, selectedObject, tshirtColor }) {
  const [textInput, setTextInput] = useState('');
  const [searchFont, setSearchFont] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('funky');
  const [loadedFonts, setLoadedFonts] = useState(new Set(['Arial']));

  // Text properties state
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textAlign, setTextAlign] = useState('left');
  const [textColor, setTextColor] = useState('#000000');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [textEffect, setTextEffect] = useState('none');
  const [circleRadius, setCircleRadius] = useState(100);

  // Update state when a text object is selected
  useEffect(() => {
    if (selectedObject && selectedObject.type === 'i-text') {
      setFontSize(selectedObject.fontSize || 32);
      setFontFamily(selectedObject.fontFamily || 'Arial');
      setFontWeight(selectedObject.fontWeight || 'normal');
      setFontStyle(selectedObject.fontStyle || 'normal');
      setTextAlign(selectedObject.textAlign || 'left');
      setTextColor(selectedObject.fill || '#000000');
      setLetterSpacing((selectedObject.charSpacing || 0) / 10);
      setLineHeight(selectedObject.lineHeight || 1.2);
    }
  }, [selectedObject]);

  // Load Google Font dynamically
  const loadFont = (fontName) => {
    if (loadedFonts.has(fontName)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      const fontUrl = fontName.replace(/ /g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${fontUrl}:wght@400;700&display=swap`;

      link.onload = () => {
        setLoadedFonts(prev => new Set([...prev, fontName]));
        resolve();
      };

      link.onerror = reject;
      document.head.appendChild(link);
    });
  };

  // Add text to canvas
  const handleAddText = async () => {
    if (!textInput.trim() || !canvasRef.current) return;

    // Load font if needed
    if (!loadedFonts.has(fontFamily)) {
      await loadFont(fontFamily);
    }

    let textObj;

    if (textEffect === 'curved') {
      textObj = createCurvedText(textInput, false);
    } else {
      textObj = new fabric.IText(textInput, {
        left: 200,
        top: 250,
        fontSize: fontSize,
        fill: textColor,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        textAlign: textAlign,
        charSpacing: letterSpacing * 10,
        lineHeight: lineHeight,
        originX: 'center',
        originY: 'center'
      });

      // Apply effects
      if (textEffect === 'shadow') {
        textObj.shadow = new fabric.Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 10,
          offsetX: 5,
          offsetY: 5
        });
      } else if (textEffect === 'outline') {
        textObj.stroke = textColor;
        textObj.strokeWidth = 2;
        textObj.fill = 'transparent';
      }
    }

    const canvas = canvasRef.current.getCanvas();
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();

    setTextInput('');
  };

  // Create curved text using individual characters positioned along a curve
  const createCurvedText = (text, isArch = false) => {
    const chars = text.split('');
    const textLength = chars.length;

    // Calculate the curve based on text length and font size
    const baseRadius = circleRadius;
    const angleSpan = Math.min(180, textLength * 8); // Limit the span
    const angleStep = angleSpan / (textLength - 1 || 1);
    const startAngle = isArch ? -angleSpan / 2 : 180 - angleSpan / 2;

    const textObjects = [];

    chars.forEach((char, i) => {
      const angle = startAngle + (i * angleStep);
      const angleRad = (angle * Math.PI) / 180;

      const x = baseRadius * Math.cos(angleRad);
      const y = baseRadius * Math.sin(angleRad) * (isArch ? -1 : 1);

      const charText = new fabric.Text(char, {
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fill: textColor,
        left: x,
        top: y,
        angle: isArch ? angle - 90 : angle + 90,
        originX: 'center',
        originY: 'center'
      });

      textObjects.push(charText);
    });

    const group = new fabric.Group(textObjects, {
      left: 200,
      top: 200,
      angle: 90,
      originX: 'center',
      originY: 'center'
    });

    return group;
  };

  // Create circular text
  const createCircleText = (text) => {
    const chars = text.split('');
    const angleStep = (Math.PI * 2) / chars.length;

    const textObjects = [];

    chars.forEach((char, i) => {
      // Start from top and go clockwise
      const angle = i * angleStep - Math.PI / 2;
      const x = circleRadius * Math.cos(angle);
      const y = circleRadius * Math.sin(angle);

      const charText = new fabric.Text(char, {
        fontSize: fontSize,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fill: textColor,
        left: x,
        top: y,
        angle: (angle * 180 / Math.PI) + 90,
        originX: 'center',
        originY: 'center'
      });

      textObjects.push(charText);
    });

    // Create group with explicit positioning
    const group = new fabric.Group(textObjects, {
      left: 200,
      top: 200,
      angle: 90,
      originX: 'center',
      originY: 'center'
    });

    return group;
  };

  // Update selected text properties
  const updateSelectedText = (property, value) => {
    const canvas = canvasRef.current?.getCanvas();
    const activeObject = canvas?.getActiveObject();

    if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
      activeObject.set(property, value);
      canvas.renderAll();
    }
  };

  // Update any selected object (text, image, group, etc.)
  const updateSelectedObject = (property, value) => {
    const canvas = canvasRef.current?.getCanvas();
    const activeObject = canvas?.getActiveObject();

    if (activeObject) {
      activeObject.set(property, value);
      canvas.renderAll();
    }
  };

  // Filter fonts based on search
  const getFilteredFonts = () => {
    const fonts = FONT_CATEGORIES[selectedCategory] || [];
    if (!searchFont) return fonts;
    return fonts.filter(font =>
      font.toLowerCase().includes(searchFont.toLowerCase())
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Add Text Section - Compact */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter text..."
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
          />
          <button
            onClick={handleAddText}
            disabled={!textInput.trim()}
            className="px-4 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
          >
            Add
          </button>
        </div>
      </div>

      {/* Scrollable Content - Hidden scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Text Effects - Visually styled previews */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Effects</h4>
          <div className="grid grid-cols-3 gap-2">
            {TEXT_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setTextEffect(effect.id)}
                className={`p-3 rounded-lg border-2 text-center transition-all h-20 flex flex-col items-center justify-center ${
                  textEffect === effect.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Visual effect preview - ABCD with effects */}
                <div className="text-xs font-bold" style={{ fontSize: '12px', fontFamily }}>
                  {effect.id === 'none' && (
                    <span>ABCD</span>
                  )}
                  {effect.id === 'curved' && (
                    <svg width="50" height="25" viewBox="0 0 50 25">
                      <defs>
                        <path id="curvepath" d="M 5 20 Q 25 2 45 20" fill="none" />
                      </defs>
                      <text fontSize="10" fontWeight="bold" fill="currentColor" fontFamily={fontFamily}>
                        <textPath href="#curvepath" startOffset="50%" textAnchor="middle">ABCD</textPath>
                      </text>
                    </svg>
                  )}
                  {effect.id === 'shadow' && (
                    <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>ABCD</span>
                  )}
                  {effect.id === 'outline' && (
                    <span style={{ WebkitTextStroke: '0.5px black', color: 'transparent' }}>ABCD</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Font</h4>

          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchFont}
                onChange={(e) => setSearchFont(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
            {Object.keys(FONT_CATEGORIES).map((category) => {
              const displayName = category === 'sansSerif'
                ? 'Sans Serif'
                : category.charAt(0).toUpperCase() + category.slice(1);

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>

          {/* Font List - Always show in actual font style */}
          <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
            {getFilteredFonts().map((font) => {
              // Load font immediately when it appears in the list
              if (!loadedFonts.has(font)) {
                loadFont(font);
              }
              return (
                <button
                  key={font}
                  onClick={() => {
                    setFontFamily(font);
                    updateSelectedText('fontFamily', font);
                  }}
                  className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                    fontFamily === font
                      ? 'bg-gray-100 text-black font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text styling now in right properties panel */}

        {/* Tips - Minimal */}
        <div className="p-4">
          <p className="text-[10px] text-gray-400 text-center">
            Double-click text to edit • Press Delete to remove
          </p>
        </div>
      </div>
    </div>
  );
}
