"use client"

export function CanvasArea({ tshirtColor, showFrontSide, layers, selectedLayer, onSelectLayer }) {
  return (
    <div className="flex-1 flex items-center justify-center relative">
      {/* T-Shirt Mockup */}
      <svg
        viewBox="0 0 500 650"
        className="h-auto w-auto max-h-[600px] max-w-[400px] drop-shadow-2xl"
        style={{ filter,0,0,0.2))" }}
      >
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.25" />
          </filter>
          <filter id="outline">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>

        {/* T-Shirt Main Body */}
        <g filter="url(#shadow)">
          {/* Front Body */}
          <path
            d="M 150 100 Q 120 120 110 200 L 110 550 Q 110 600 160 600 L 340 600 Q 390 600 390 550 L 390 200 Q 380 120 350 100 Z"
            fill={tshirtColor}
            stroke="#333"
            strokeWidth="2"
          />

          {/* Sleeves */}
          <ellipse cx="90" cy="180" rx="50" ry="60" fill={tshirtColor} stroke="#333" strokeWidth="2" />
          <ellipse cx="410" cy="180" rx="50" ry="60" fill={tshirtColor} stroke="#333" strokeWidth="2" />

          {/* Neck */}
          <ellipse cx="250" cy="100" rx="40" ry="45" fill={tshirtColor} stroke="#333" strokeWidth="2" />
        </g>

        {/* Design Print Area - Front */}
        {showFrontSide && (
          <>
            <defs>
              <clipPath id="designArea">
                <path d="M 180 250 L 320 250 L 320 500 L 180 500 Z" />
              </clipPath>
            </defs>

            {/* Design area border - dashed green */}
            <g clipPath="url(#designArea)">
              <rect
                x="180"
                y="250"
                width="140"
                height="250"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeDasharray="8,4"
                opacity="0.3"
              />
            </g>

            {/* Sample Avocado Design */}
            {layers.length > 0 && layers[0] && (
              <g
                transform={`translate(${250 + layers[0].posX}, ${375 + layers[0].posY}) rotate(${layers[0].rotation}) scale(${layers[0].scaleX / 100}, ${layers[0].scaleY / 100})`}
                onClick={() => onSelectLayer(layers[0].id)}
                className="cursor-pointer"
                style={{
                  opacity: selectedLayer === layers[0].id ? 1,
                }}
              >
                {/* Avocado Body */}
                <ellipse cx="0" cy="0" rx="45" ry="55" fill="#A3D977" stroke="#333" strokeWidth="1.5" />
                <ellipse cx="0" cy="5" rx="30" ry="35" fill="#8B6F47" opacity="0.9" stroke="none" />

                {/* Avocado Pit */}
                <circle cx="0" cy="8" r="25" fill="#D2691E" stroke="#333" strokeWidth="1.5" />

                {/* Leaf */}
                <path d="M 30 -35 Q 50 -50 55 -25 Q 40 -10 30 -15 Z" fill="#2D5016" stroke="#333" strokeWidth="1" />

                {/* Text - VEGAN */}
                <text
                  x="0"
                  y="50"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill="#2D5016"
                  fontFamily="Arial"
                >
                  VEGAN
                </text>

                {/* Selection box if selected */}
                {selectedLayer === layers[0].id && (
                  <>
                    <rect
                      x="-50"
                      y="-65"
                      width="100"
                      height="140"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                    {/* Corner handles */}
                    {[
                      [-50, -65],
                      [50, -65],
                      [50, 75],
                      [-50, 75],
                    ].map((pos, i) => (
                      <circle key={i} cx={pos[0]} cy={pos[1]} r="5" fill="#22c55e" stroke="white" strokeWidth="1.5" />
                    ))}
                    {/* Center handle */}
                    <circle cx="0" cy="0" r="6" fill="#22c55e" stroke="white" strokeWidth="1.5" />
                  </>
                )}
              </g>
            )}
          </>
        )}

        {/* Back Side */}
        {!showFrontSide && (
          <text x="250" y="350" textAnchor="middle" fontSize="24" fill="#999" fontStyle="italic">
            Back side - empty
          </text>
        )}
      </svg>

      {/* Front / Back Toggle */}
      <div className="absolute bottom-6 flex gap-3 bg-card px-6 py-3 rounded-full border border-border shadow-soft">
        <button
          onClick={() => onSelectLayer(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showFrontSide ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Front side
        </button>
        <button
          onClick={() => onSelectLayer(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showFrontSide ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Back side
        </button>
      </div>
    </div>
  )
}
