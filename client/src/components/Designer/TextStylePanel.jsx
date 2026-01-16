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

// Text effect presets
const TEXT_EFFECTS = [
  { id: 'none', name: 'Normal', preview: 'Text' },
  { id: 'curved', name: 'Curved', preview: '⌒Text⌒' },
  { id: 'arch', name: 'Arch', preview: '⌢Text⌣' },
  { id: 'circle', name: 'Circle', preview: '◯Text' },
  { id: 'shadow', name: 'Shadow', preview: 'Text' },
  { id: 'outline', name: 'Outline', preview: 'Text' }
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

    if (textEffect === 'curved' || textEffect === 'arch') {
      textObj = createCurvedText(textInput, textEffect === 'arch');
    } else if (textEffect === 'circle') {
      textObj = createCircleText(textInput);
    } else {
      textObj = new fabric.IText(textInput, {
        left: 100,
        top: 100,
        fontSize: fontSize,
        fill: textColor,
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        textAlign: textAlign,
        charSpacing: letterSpacing * 10,
        lineHeight: lineHeight
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
      {/* Add Text Section */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Enter your text</label>
        <textarea
          placeholder="Type your text here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          rows={3}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button
          onClick={handleAddText}
          disabled={!textInput.trim()}
          className="w-full mt-3 px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Add Text
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Text Effects */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Text Effects</h4>
          <div className="grid grid-cols-3 gap-2">
            {TEXT_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setTextEffect(effect.id)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  textEffect === effect.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg mb-1">{effect.preview}</div>
                <div className="text-xs text-gray-600">{effect.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Font Family</h4>

          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchFont}
                onChange={(e) => setSearchFont(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="flex gap-2 mb-3 overflow-x-auto">
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
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>

          {/* Font List */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {getFilteredFonts().map((font) => (
              <button
                key={font}
                onClick={() => {
                  setFontFamily(font);
                  loadFont(font);
                  updateSelectedText('fontFamily', font);
                }}
                onMouseEnter={() => loadFont(font)}
                className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                  fontFamily === font
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                style={{ fontFamily: loadedFonts.has(font) ? font : 'Arial' }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        {/* Text Properties */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Text Properties</h4>

          {/* Font Size */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Font Size: {fontSize}px
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="12"
                max="200"
                value={fontSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value);
                  setFontSize(size);
                  updateSelectedText('fontSize', size);
                }}
                className="flex-1"
              />
              <input
                type="number"
                value={fontSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value) || 12;
                  setFontSize(size);
                  updateSelectedText('fontSize', size);
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  updateSelectedText('fill', e.target.value);
                }}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  updateSelectedText('fill', e.target.value);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Font Weight & Style */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => {
                  setFontWeight(e.target.value);
                  updateSelectedText('fontWeight', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="100">Thin</option>
                <option value="300">Light</option>
                <option value="500">Medium</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Style</label>
              <select
                value={fontStyle}
                onChange={(e) => {
                  setFontStyle(e.target.value);
                  updateSelectedText('fontStyle', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
              </select>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Alignment</label>
            <div className="grid grid-cols-4 gap-2">
              {['left', 'center', 'right', 'justify'].map((align) => (
                <button
                  key={align}
                  onClick={() => {
                    setTextAlign(align);
                    updateSelectedText('textAlign', align);
                  }}
                  className={`p-2 rounded border-2 transition-all ${
                    textAlign === align
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={align.charAt(0).toUpperCase() + align.slice(1)}
                >
                  <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    {align === 'left' && (
                      <path d="M3 6h18v2H3V6zm0 5h12v2H3v-2zm0 5h18v2H3v-2z" />
                    )}
                    {align === 'center' && (
                      <path d="M3 6h18v2H3V6zm3 5h12v2H6v-2zm-3 5h18v2H3v-2z" />
                    )}
                    {align === 'right' && (
                      <path d="M3 6h18v2H3V6zm6 5h12v2H9v-2zm-6 5h18v2H3v-2z" />
                    )}
                    {align === 'justify' && (
                      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                    )}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Circle/Curve Radius - Only show for circular and curved effects */}
          {(textEffect === 'circle' || textEffect === 'curved' || textEffect === 'arch') && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Curve Radius: {circleRadius}px
              </label>
              <input
                type="range"
                min="50"
                max="250"
                value={circleRadius}
                onChange={(e) => setCircleRadius(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Letter Spacing */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Letter Spacing: {letterSpacing}
            </label>
            <input
              type="range"
              min="-5"
              max="50"
              step="0.5"
              value={letterSpacing}
              onChange={(e) => {
                const spacing = parseFloat(e.target.value);
                setLetterSpacing(spacing);
                updateSelectedText('charSpacing', spacing * 10);
              }}
              className="w-full"
            />
          </div>

          {/* Rotation */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Rotation: {selectedObject?.angle?.toFixed(0) || 0}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedObject?.angle || 0}
              onChange={(e) => {
                const angle = parseInt(e.target.value);
                updateSelectedObject('angle', angle);
              }}
              className="w-full"
            />
          </div>

          {/* Line Height */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Line Height: {lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={lineHeight}
              onChange={(e) => {
                const height = parseFloat(e.target.value);
                setLineHeight(height);
                updateSelectedText('lineHeight', height);
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="p-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-900 mb-2">Text Tips:</p>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Double-click text on canvas to edit</li>
              <li>• Drag corners to resize</li>
              <li>• Select and press Delete to remove</li>
              <li>• Use curved text for unique designs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
