import React, { useState } from 'react';
import { TrendingUp, BarChart3, LineChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function SalesPerformanceChart({
  chartPoints = [],
  chartType = 'line',
  setChartType,
  chartMaxSale = 0,
  chartNiceMax = 100,
  totalSales = 0,
  totalCount = 0,
  periodTitle = 'Últimos 7 dias'
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const svgWidth = 760;
  const svgHeight = 220;
  const pLeft = 60;
  const pRight = 30;
  const pTop = 28;
  const pBottom = 42;
  const plotW = svgWidth - pLeft - pRight;
  const plotH = svgHeight - pTop - pBottom;
  const bottomY = pTop + plotH;

  // Calcula coordenadas x e y para cada ponto
  const pointsWithCoords = chartPoints.map((pt, idx) => {
    const x = pLeft + (chartPoints.length > 1 ? (idx / (chartPoints.length - 1)) * plotW : plotW / 2);
    const y = pTop + plotH - (chartNiceMax > 0 ? (pt.value / chartNiceMax) * plotH : 0);
    return { ...pt, x, y };
  });

  // Linha contínua
  const linePathD = pointsWithCoords.length > 0
    ? pointsWithCoords.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')
    : '';

  // Área preenchida sob a linha
  const areaPathD = pointsWithCoords.length > 1
    ? `M ${pointsWithCoords[0].x.toFixed(1)} ${bottomY} L ${pointsWithCoords.map(pt => `${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' L ')} L ${pointsWithCoords[pointsWithCoords.length - 1].x.toFixed(1)} ${bottomY} Z`
    : '';

  // Configuração para salto de labels se houver muitos pontos
  const labelStep = chartPoints.length > 20 ? 3 : (chartPoints.length > 12 ? 2 : 1);
  const barWidth = Math.max(10, Math.min(36, (plotW / (chartPoints.length || 1)) * 0.65));

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 metallic-card space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Desempenho de Atendimentos ({periodTitle})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Total contabilizado no gráfico:{' '}
            <strong className="text-amber-400 font-bold">{formatCurrency(totalSales)}</strong> em{' '}
            <strong className="text-white font-bold">{totalCount}</strong> atendimento(s)
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Pico de Faturamento */}
          {chartMaxSale > 0 && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              Pico: {formatCurrency(chartMaxSale)}
            </span>
          )}

          {/* Alternador Linha / Barras */}
          <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                chartType === 'line'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Linha"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Linha</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Barras"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[220px] sm:h-[240px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="100%"
          className="overflow-visible select-none"
        >
          <defs>
            {/* Gradiente da Área sob a Linha */}
            <linearGradient id="gradientBarberArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#b45309" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#08090b" stopOpacity="0" />
            </linearGradient>

            {/* Gradiente das Barras */}
            <linearGradient id="gradientBarberBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Gradiente da Linha do Gráfico */}
            <linearGradient id="gradientBarberStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade Horizontais e Eixo Y */}
          {[1, 0.66, 0.33, 0].map((ratio, i) => {
            const yVal = pTop + plotH * (1 - ratio);
            const currencyVal = chartNiceMax * ratio;
            return (
              <g key={i}>
                <line
                  x1={pLeft}
                  y1={yVal}
                  x2={svgWidth - pRight}
                  y2={yVal}
                  stroke={ratio === 0 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}
                  strokeDasharray={ratio === 0 ? "none" : "4 4"}
                />
                <text
                  x={pLeft - 8}
                  y={yVal + 3.5}
                  textAnchor="end"
                  fill="rgba(148, 163, 184, 0.8)"
                  fontSize="10px"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  R$ {currencyVal >= 1000 ? `${(currencyVal / 1000).toFixed(1)}k` : currencyVal.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* MODO BARRAS */}
          {chartType === 'bar' && pointsWithCoords.map((pt) => {
            const h = Math.max(3, bottomY - pt.y);
            const isHovered = hoveredPoint?.key === pt.key;
            return (
              <g key={pt.key}>
                <rect
                  x={pt.x - barWidth / 2}
                  y={pt.value > 0 ? pt.y : bottomY - 3}
                  width={barWidth}
                  height={pt.value > 0 ? h : 3}
                  rx="4"
                  fill={isHovered ? "#fde047" : "url(#gradientBarberBar)"}
                  opacity={isHovered ? 1 : 0.88}
                  className="transition-all duration-200"
                />
                {pt.value > 0 && chartPoints.length <= 15 && (
                  <text
                    x={pt.x}
                    y={pt.y - 6}
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="9.5px"
                    fontWeight="bold"
                  >
                    {pt.value >= 1000 ? `${(pt.value / 1000).toFixed(1)}k` : `R$ ${pt.value.toFixed(0)}`}
                  </text>
                )}
              </g>
            );
          })}

          {/* MODO LINHA */}
          {chartType === 'line' && (
            <>
              {/* Preenchimento de Área com Gradiente */}
              {areaPathD && (
                <path
                  d={areaPathD}
                  fill="url(#gradientBarberArea)"
                />
              )}

              {/* Traço da Linha */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="url(#gradientBarberStroke)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 2px 6px rgba(245, 158, 11, 0.4))"
                />
              )}

              {/* Pontos Circulares */}
              {pointsWithCoords.map((pt) => {
                const isHovered = hoveredPoint?.key === pt.key;
                return (
                  <g key={pt.key}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 7 : (pt.value > 0 ? 5 : 3)}
                      fill={pt.value > 0 ? "#f59e0b" : "rgba(255,255,255,0.3)"}
                      stroke="#08090b"
                      strokeWidth="2.5"
                      className="transition-all duration-150"
                    />
                    {pt.value > 0 && chartPoints.length <= 14 && (
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="9.5px"
                        fontWeight="bold"
                        filter="drop-shadow(0 1px 3px rgba(0,0,0,0.8))"
                      >
                        R$ {pt.value >= 1000 ? `${(pt.value / 1000).toFixed(1)}k` : pt.value.toFixed(0)}
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* Áreas Invisíveis de Captura para Hover */}
          {pointsWithCoords.map((pt) => {
            const colW = plotW / (chartPoints.length || 1);
            return (
              <rect
                key={`capture-${pt.key}`}
                x={pt.x - colW / 2}
                y={pTop}
                width={colW}
                height={plotH + 20}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Rótulos do Eixo X */}
          {pointsWithCoords.map((pt, idx) => {
            if (idx % labelStep !== 0 && idx !== pointsWithCoords.length - 1) return null;
            const isHovered = hoveredPoint?.key === pt.key;
            return (
              <text
                key={`label-${pt.key}`}
                x={pt.x}
                y={bottomY + 22}
                textAnchor="middle"
                fill={isHovered ? "#ffffff" : "rgba(148, 163, 184, 0.75)"}
                fontSize="11px"
                fontWeight={isHovered ? "700" : "500"}
              >
                {pt.label}
              </text>
            );
          })}

          {/* Floating Tooltip no Hover */}
          {hoveredPoint && (
            <g
              transform={`translate(${Math.min(svgWidth - 170, Math.max(pLeft, hoveredPoint.x - 80))}, ${Math.max(6, hoveredPoint.y - 58)})`}
              className="pointer-events-none transition-all duration-150"
            >
              <rect
                width="160"
                height="50"
                rx="10"
                fill="#0f1115"
                stroke="#f59e0b"
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 12px rgba(0,0,0,0.75))"
              />
              <text
                x="12"
                y="18"
                fill="#94a3b8"
                fontSize="10px"
                fontWeight="600"
              >
                {hoveredPoint.fullLabel || hoveredPoint.label}
              </text>
              <text
                x="12"
                y="36"
                fill="#fbbf24"
                fontSize="13px"
                fontWeight="900"
              >
                {formatCurrency(hoveredPoint.value)}
              </text>
              <text
                x="148"
                y="35"
                textAnchor="end"
                fill="#e2e8f0"
                fontSize="10.5px"
                fontWeight="600"
              >
                {hoveredPoint.count || 0} cortes
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
