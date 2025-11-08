"use client";

import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Line, Group, Text } from "react-konva";
import type { Table } from "@/src/types/table";
import { tablesService } from "@/src/services/tables.service";
import { Spinner } from "@/src/components/common/Spinner";
import { BlockTitle } from "@/src/components/common/BlockTitle";

export interface RestaurantSchemeProps {
  restaurantId: number | string;
  selectedTableId?: number | null;
  onTableClick?: (table: Table) => void;
  className?: string;
  bookedTableIds?: number[]; // Array of table IDs that are booked/unavailable
  date?: string; // Optional date to check availability
}

export type TablePresetType = "round" | "square" | "rect" | "corner";

export interface TablePreset {
  type: TablePresetType;
  // Size in percentage of stage width/height
  size: {
    width?: number; // percentage for square, rect, corner
    height?: number; // percentage for square, rect, corner
    radius?: number; // percentage for round
  };
  seatsRange: { min: number; max: number };
}

export const TABLE_PRESETS: Record<TablePresetType, TablePreset> = {
  round: {
    type: "round",
    size: { radius: 3 }, // 3% of stage width
    seatsRange: { min: 4, max: 8 },
  },
  square: {
    type: "square",
    size: { width: 4, height: 4 }, // 4% of stage width/height
    seatsRange: { min: 4, max: 8 },
  },
  rect: {
    type: "rect",
    size: { width: 6, height: 3.5 }, // 6% width, 3.5% height
    seatsRange: { min: 4, max: 10 },
  },
  corner: {
    type: "corner",
    size: { width: 5, height: 5 }, // 5% of stage width/height
    seatsRange: { min: 4, max: 10 },
  },
};

/**
 * Determine table preset type based on number of seats
 */
const getTablePresetType = (seats: number, index: number): TablePresetType => {
  if (seats >= 4 && seats <= 8) {
    // Alternate between round and square for 4-8 seats
    return index % 2 === 0 ? "round" : "square";
  } else if (seats > 8 && seats <= 10) {
    // Alternate between rect and corner for 9-10 seats
    return index % 2 === 0 ? "rect" : "corner";
  } else if (seats < 4) {
    // Default to round for small tables
    return "round";
  } else {
    // Default to rect for large tables
    return "rect";
  }
};

export const RestaurantScheme: React.FC<RestaurantSchemeProps> = ({
  restaurantId,
  selectedTableId,
  onTableClick,
  className,
  bookedTableIds = [],
  date,
}) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  
  // Helper function to check if table is booked
  const isTableBooked = (tableId: number): boolean => {
    return bookedTableIds.includes(tableId);
  };
  
  /**
   * Generate restaurant layout based on the provided scheme
   * Returns tables with their positions and types
   */
  const generateRestaurantLayout = React.useCallback(() => {
    const layoutTables: Array<{
      id: string;
      number: string;
      seats: number;
      type: TablePresetType;
      x: number; // percentage
      y: number; // percentage
      rotation?: number; // degrees
    }> = [];

    // Left side - Long bar/counter along top-left wall
    layoutTables.push({
      id: "bar-1",
      number: "Bar",
      seats: 0,
      type: "rect",
      x: 5, // 5% from left
      y: 5, // 5% from top
      rotation: 0,
    });

    // Left side - Rectangular table below bar (6 seats)
    layoutTables.push({
      id: "rect-1",
      number: "1",
      seats: 6,
      type: "rect",
      x: 8, // 8% from left
      y: 18, // 18% from top
      rotation: 0, // horizontal
    });

    // Left side - Three vertical rectangular tables (6 seats each)
    layoutTables.push({
      id: "rect-2",
      number: "2",
      seats: 6,
      type: "rect",
      x: 8,
      y: 32,
      rotation: 90, // vertical
    });
    layoutTables.push({
      id: "rect-3",
      number: "3",
      seats: 6,
      type: "rect",
      x: 8,
      y: 46,
      rotation: 90,
    });
    layoutTables.push({
      id: "rect-4",
      number: "4",
      seats: 6,
      type: "rect",
      x: 8,
      y: 60,
      rotation: 90,
    });

    // Central area - Round tables (6 seats each)
    // Top row - 2 round tables
    layoutTables.push({
      id: "round-1",
      number: "5",
      seats: 6,
      type: "round",
      x: 35, // 35% from left
      y: 15, // 15% from top
    });
    layoutTables.push({
      id: "round-2",
      number: "6",
      seats: 6,
      type: "round",
      x: 50,
      y: 15,
    });

    // Middle row - 2 round tables
    layoutTables.push({
      id: "round-3",
      number: "7",
      seats: 6,
      type: "round",
      x: 35,
      y: 35,
    });
    layoutTables.push({
      id: "round-4",
      number: "8",
      seats: 6,
      type: "round",
      x: 50,
      y: 35,
    });

    // Bottom row - 2 round tables
    layoutTables.push({
      id: "round-5",
      number: "9",
      seats: 6,
      type: "round",
      x: 35,
      y: 55,
    });
    layoutTables.push({
      id: "round-6",
      number: "10",
      seats: 6,
      type: "round",
      x: 50,
      y: 55,
    });

    // Bottom side - Four horizontal rectangular tables (4 seats each)
    layoutTables.push({
      id: "rect-5",
      number: "11",
      seats: 4,
      type: "rect",
      x: 15,
      y: 80,
      rotation: 0,
    });
    layoutTables.push({
      id: "rect-6",
      number: "12",
      seats: 4,
      type: "rect",
      x: 30,
      y: 80,
      rotation: 0,
    });
    layoutTables.push({
      id: "rect-7",
      number: "13",
      seats: 4,
      type: "rect",
      x: 45,
      y: 80,
      rotation: 0,
    });
    layoutTables.push({
      id: "rect-8",
      number: "14",
      seats: 4,
      type: "rect",
      x: 60,
      y: 80,
      rotation: 0,
    });

    return layoutTables;
  }, []);

  // Responsive stage size
  useEffect(() => {
    const updateStageSize = () => {
      const container = document.querySelector('[data-scheme-container]') as HTMLElement;
      if (container) {
        const containerWidth = container.clientWidth - 32; // Account for padding
        const containerHeight = Math.max(600, containerWidth * 0.75); // 4:3 aspect ratio
        setStageSize({
          width: containerWidth,
          height: containerHeight,
        });
      }
    };

    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    return () => window.removeEventListener('resize', updateStageSize);
  }, []);

  // Generate walls based on the layout
  const wallThickness = Math.max(8, stageSize.width * 0.015); // 1.5% of width, min 8px
  const walls = [
    // Outer walls
    { x: 0, y: 0, width: stageSize.width, height: wallThickness }, // Top
    { x: 0, y: 0, width: wallThickness, height: stageSize.height }, // Left
    { x: 0, y: stageSize.height - wallThickness, width: stageSize.width, height: wallThickness }, // Bottom
    { x: stageSize.width - wallThickness, y: 0, width: wallThickness, height: stageSize.height }, // Right
    
    // Internal vertical wall (separating main area from service area on the right)
    { 
      x: stageSize.width * 0.75 - wallThickness / 2, 
      y: 0, 
      width: wallThickness, 
      height: stageSize.height 
    },
    
    // Small horizontal wall in top-left corner (alcove)
    { 
      x: 0, 
      y: 0, 
      width: stageSize.width * 0.12, 
      height: wallThickness 
    },
  ];

  useEffect(() => {
    // For now, use the generated layout instead of fetching from API
    // This creates a visual representation of the restaurant scheme
    try {
      setLoading(true);
      setError(null);
      
      // Generate layout tables
      const layoutTables = generateRestaurantLayout();
      
      // Map layout tables to Table format
      const mappedTables: Table[] = layoutTables
        .filter(t => t.seats > 0) // Filter out bar/counter
        .map((layoutTable, index) => ({
          id: index + 1,
          restaurant: Number(restaurantId),
          restaurant_id: Number(restaurantId),
          number: layoutTable.number,
          seats: layoutTable.seats,
        }));
      
      setTables(mappedTables);
      
      // Store layout data for rendering
      (window as any).__restaurantLayout = layoutTables;
    } catch (err) {
      console.error("Error generating layout:", err);
      setError("Failed to generate restaurant scheme");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, stageSize.width, stageSize.height, generateRestaurantLayout]);

  // Get table position from layout
  const getTablePosition = (table: Table) => {
    const layoutTables = (window as any).__restaurantLayout as Array<{
      id: string;
      number: string;
      seats: number;
      type: TablePresetType;
      x: number;
      y: number;
      rotation?: number;
    }> || [];
    
    const layoutTable = layoutTables.find(lt => lt.number === table.number);
    if (layoutTable) {
      return {
        x: (stageSize.width * layoutTable.x) / 100,
        y: (stageSize.height * layoutTable.y) / 100,
        type: layoutTable.type,
        rotation: layoutTable.rotation || 0,
      };
    }
    
    // Fallback to grid layout if not found
    const index = tables.indexOf(table);
    const cols = Math.ceil(Math.sqrt(tables.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacingX = stageSize.width * 0.12;
    const spacingY = stageSize.height * 0.12;
    const startX = stageSize.width * 0.1;
    const startY = stageSize.height * 0.1;
    
    return {
      x: startX + col * spacingX,
      y: startY + row * spacingY,
      type: getTablePresetType(table.seats, index),
      rotation: 0,
    };
  };

  /**
   * Calculate chair positions around a table
   */
  const getChairPositions = (
    presetType: TablePresetType,
    seats: number,
    tableWidth: number,
    tableHeight: number,
    tableRadius?: number
  ): Array<{ x: number; y: number; angle: number }> => {
    const chairs: Array<{ x: number; y: number; angle: number }> = [];
    const baseSize = Math.min(stageSize.width, stageSize.height);
    const seatSize = baseSize * 0.012; // 1.2% of base size
    const chairOffset = seatSize * 0.3; // Small gap to touch table edge

    switch (presetType) {
      case "round": {
        const radius = tableRadius || 0;
        // Distribute chairs evenly around the circle
        for (let i = 0; i < seats; i++) {
          const angle = (i * 2 * Math.PI) / seats;
          const distance = radius + chairOffset;
          chairs.push({
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            angle: angle * (180 / Math.PI), // Convert to degrees
          });
        }
        break;
      }

      case "square": {
        const size = tableWidth;
        const halfSize = size / 2;
        // Distribute chairs symmetrically: equal number per side
        const chairsPerSide = Math.ceil(seats / 4);
        const actualChairsPerSide = Math.floor(seats / 4);
        const remainder = seats % 4;
        
        // Distribute chairs along each side symmetrically
        let chairIndex = 0;
        for (let side = 0; side < 4 && chairIndex < seats; side++) {
          // Add one extra chair to first 'remainder' sides if seats don't divide evenly
          const sideChairs = actualChairsPerSide + (side < remainder ? 1 : 0);
          
          for (let i = 0; i < sideChairs; i++) {
            let x = 0, y = 0, angle = 0;
            // Symmetric positioning: distribute evenly along the side
            const spacing = size / (sideChairs + 1);
            const position = (i + 1) * spacing;
            
            switch (side) {
              case 0: // Top side - chairs face down (towards table)
                x = -halfSize + position;
                y = -halfSize - chairOffset;
                angle = 90; // Face towards table (down)
                break;
              case 1: // Right side - chairs face left (towards table)
                x = halfSize + chairOffset;
                y = -halfSize + position;
                angle = 180; // Face towards table (left)
                break;
              case 2: // Bottom side - chairs face up (towards table)
                x = halfSize - position;
                y = halfSize + chairOffset;
                angle = 270; // Face towards table (up)
                break;
              case 3: // Left side - chairs face right (towards table)
                x = -halfSize - chairOffset;
                y = halfSize - position;
                angle = 0; // Face towards table (right)
                break;
            }
            chairs.push({ x, y, angle });
            chairIndex++;
          }
        }
        break;
      }

      case "rect": {
        const width = tableWidth;
        const height = tableHeight;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        
        // Distribute chairs symmetrically: more on long sides, fewer on short sides
        // Calculate optimal distribution
        const isWide = width > height;
        const longSide = isWide ? width : height;
        const shortSide = isWide ? height : width;
        
        // Distribute chairs proportionally
        const longSideChairs = Math.ceil(seats * (longSide / (longSide * 2 + shortSide * 2)));
        const shortSideChairs = Math.ceil((seats - longSideChairs * 2) / 2);
        
        let chairIndex = 0;
        
        // Top side (long if wide, short if tall) - chairs face down (towards table)
        const topChairs = isWide ? longSideChairs : shortSideChairs;
        const topSpacing = (isWide ? width : height) / (topChairs + 1);
        for (let i = 0; i < topChairs && chairIndex < seats; i++) {
          const position = (i + 1) * topSpacing;
          chairs.push({
            x: isWide ? -halfWidth + position : -halfWidth - chairOffset,
            y: isWide ? -halfHeight - chairOffset : -halfHeight + position,
            angle: isWide ? 90 : 180, // Face towards table
          });
          chairIndex++;
        }
        
        // Right side (short if wide, long if tall) - chairs face left (towards table)
        const rightChairs = isWide ? shortSideChairs : longSideChairs;
        const rightSpacing = (isWide ? height : width) / (rightChairs + 1);
        for (let i = 0; i < rightChairs && chairIndex < seats; i++) {
          const position = (i + 1) * rightSpacing;
          chairs.push({
            x: isWide ? halfWidth + chairOffset : halfWidth - position,
            y: isWide ? -halfHeight + position : -halfHeight - chairOffset,
            angle: isWide ? 180 : 90, // Face towards table
          });
          chairIndex++;
        }
        
        // Bottom side (long if wide, short if tall) - chairs face up (towards table)
        const bottomChairs = isWide ? longSideChairs : shortSideChairs;
        const bottomSpacing = (isWide ? width : height) / (bottomChairs + 1);
        for (let i = 0; i < bottomChairs && chairIndex < seats; i++) {
          const position = (i + 1) * bottomSpacing;
          chairs.push({
            x: isWide ? halfWidth - position : halfWidth + chairOffset,
            y: isWide ? halfHeight + chairOffset : halfHeight - position,
            angle: isWide ? 270 : 0, // Face towards table
          });
          chairIndex++;
        }
        
        // Left side (short if wide, long if tall) - chairs face right (towards table)
        const leftChairs = isWide ? shortSideChairs : longSideChairs;
        const leftSpacing = (isWide ? height : width) / (leftChairs + 1);
        for (let i = 0; i < leftChairs && chairIndex < seats; i++) {
          const position = (i + 1) * leftSpacing;
          chairs.push({
            x: isWide ? -halfWidth - chairOffset : -halfWidth + position,
            y: isWide ? halfHeight - position : halfHeight + chairOffset,
            angle: isWide ? 0 : 270, // Face towards table
          });
          chairIndex++;
        }
        break;
      }

      case "corner": {
        const width = tableWidth;
        const height = tableHeight;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const cornerSize = width * 0.4;
        
        // Distribute chairs around L-shape
        const chairsPerSection = Math.ceil(seats / 3); // Divide into 3 sections
        
        let chairIndex = 0;
        
        // Top horizontal section - chairs face down (towards table)
        for (let i = 0; i < chairsPerSection && chairIndex < seats; i++) {
          const position = (i + 1) / (chairsPerSection + 1);
          chairs.push({
            x: -halfWidth + cornerSize + (position * (width - cornerSize)),
            y: -halfHeight - chairOffset,
            angle: 90, // Face towards table (down)
          });
          chairIndex++;
        }
        
        // Right vertical section - chairs face left (towards table)
        for (let i = 0; i < chairsPerSection && chairIndex < seats; i++) {
          const position = (i + 1) / (chairsPerSection + 1);
          chairs.push({
            x: halfWidth + chairOffset,
            y: -halfHeight + cornerSize + (position * (height - cornerSize)),
            angle: 180, // Face towards table (left)
          });
          chairIndex++;
        }
        
        // Corner and remaining sides - chairs face towards table center
        const remainingChairs = seats - chairIndex;
        for (let i = 0; i < remainingChairs; i++) {
          const angle = (i * 2 * Math.PI) / remainingChairs;
          const distance = Math.max(halfWidth, halfHeight) + chairOffset;
          // Face towards table center (add 180 to face inward)
          const chairAngle = (angle * (180 / Math.PI) + 180) % 360;
          chairs.push({
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            angle: chairAngle,
          });
        }
        break;
      }
    }

    return chairs;
  };

  /**
   * Render a single chair (top view) - simple square with rounded corners
   */
  const renderChair = (x: number, y: number, angle: number, isSelected: boolean) => {
    const baseSize = Math.min(stageSize.width, stageSize.height);
    const chairSize = baseSize * 0.012; // 1.2% of base size
    
    const chairColor = isSelected ? "#6E152F" : "#8B7355";
    const chairStroke = isSelected ? "#4a0f1f" : "#5a4a3a";
    
    return (
      <Group key={`chair-${x}-${y}-${angle}`} x={x} y={y} rotation={angle}>
        <Rect
          width={chairSize}
          height={chairSize}
          fill={chairColor}
          stroke={chairStroke}
          strokeWidth={2}
          offsetX={chairSize / 2}
          offsetY={chairSize / 2}
          cornerRadius={chairSize * 0.2}
        />
      </Group>
    );
  };

  const renderTable = (table: Table, index: number) => {
    const positionData = getTablePosition(table);
    const position = { x: positionData.x, y: positionData.y };
    const isSelected = selectedTableId === table.id;
    const isBooked = isTableBooked(table.id);
    const presetType = positionData.type || getTablePresetType(table.seats, index);
    const preset = TABLE_PRESETS[presetType];
    
    // Determine table colors based on status
    const getTableColors = () => {
      if (isSelected) {
        return {
          fill: "#8B1C3B",
          stroke: "#6E152F",
          center: "#6E152F",
          centerStroke: "#4a0f1f",
          highlight: "#A83D5F",
        };
      }
      if (isBooked) {
        return {
          fill: "#EF4444", // Red for booked
          stroke: "#DC2626",
          center: "#DC2626",
          centerStroke: "#B91C1C",
          highlight: "#F87171",
        };
      }
      // Available (green)
      return {
        fill: "#10B981", // Green for available
        stroke: "#059669",
        center: "#059669",
        centerStroke: "#047857",
        highlight: "#34D399",
      };
    };
    
    const colors = getTableColors();

    // Calculate sizes based on percentages
    const baseSize = Math.min(stageSize.width, stageSize.height);
    
    const renderTableShape = () => {
      switch (presetType) {
        case "round": {
          const radius = (baseSize * (preset.size.radius || 3)) / 100;
          const chairs = getChairPositions("round", table.seats, 0, 0, radius);
          
          return (
            <>
              {/* Render chairs first (behind table) */}
              {chairs.map((chair, idx) => renderChair(chair.x, chair.y, chair.angle, isSelected || isBooked))}
              
              {/* Table top (on top of chairs) */}
              <Circle
                radius={radius}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isSelected ? 4 : 3}
                opacity={isBooked ? 0.7 : 1}
              />
              
              {/* Table center (decorative) */}
              <Circle
                radius={radius * 0.3}
                fill={colors.center}
                stroke={colors.centerStroke}
                strokeWidth={1}
                opacity={isBooked ? 0.7 : 1}
              />
              
              {/* Table edge highlight */}
              <Circle
                radius={radius}
                fill="transparent"
                stroke={colors.highlight}
                strokeWidth={1}
                opacity={isBooked ? 0.3 : 0.5}
              />
              
              {/* Booked indicator - diagonal lines */}
              {isBooked && (
                <>
                  <Line
                    points={[-radius, -radius, radius, radius]}
                    stroke="#B91C1C"
                    strokeWidth={3}
                    opacity={0.8}
                  />
                  <Line
                    points={[-radius, radius, radius, -radius]}
                    stroke="#B91C1C"
                    strokeWidth={3}
                    opacity={0.8}
                  />
                </>
              )}
            </>
          );
        }
        
        case "square": {
          const size = (baseSize * (preset.size.width || 4)) / 100;
          const chairs = getChairPositions("square", table.seats, size, size);
          
          return (
            <>
              {/* Render chairs first (behind table) */}
              {chairs.map((chair, idx) => renderChair(chair.x, chair.y, chair.angle, isSelected || isBooked))}
              
              {/* Table top (on top of chairs) */}
              <Rect
                width={size}
                height={size}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isSelected ? 4 : 3}
                offsetX={size / 2}
                offsetY={size / 2}
                cornerRadius={size * 0.1}
                opacity={isBooked ? 0.7 : 1}
              />
              
              {/* Table center decorative */}
              <Rect
                width={size * 0.4}
                height={size * 0.4}
                fill={colors.center}
                stroke={colors.centerStroke}
                strokeWidth={1}
                offsetX={(size * 0.4) / 2}
                offsetY={(size * 0.4) / 2}
                cornerRadius={size * 0.05}
                opacity={isBooked ? 0.7 : 1}
              />
              
              {/* Booked indicator - diagonal lines */}
              {isBooked && (
                <>
                  <Line
                    points={[-size / 2, -size / 2, size / 2, size / 2]}
                    stroke="#4B5563"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                  <Line
                    points={[-size / 2, size / 2, size / 2, -size / 2]}
                    stroke="#4B5563"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                </>
              )}
            </>
          );
        }
        
        case "rect": {
          const width = (baseSize * (preset.size.width || 6)) / 100;
          const height = (baseSize * (preset.size.height || 3.5)) / 100;
          const chairs = getChairPositions("rect", table.seats, width, height);
          
          return (
            <>
              {/* Render chairs first (behind table) */}
              {chairs.map((chair, idx) => renderChair(chair.x, chair.y, chair.angle, isSelected || isBooked))}
              
              {/* Table top (on top of chairs) */}
              <Rect
                width={width}
                height={height}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isSelected ? 4 : 3}
                offsetX={width / 2}
                offsetY={height / 2}
                cornerRadius={Math.min(width, height) * 0.15}
                opacity={isBooked ? 0.7 : 1}
              />
              
              {/* Table center decorative line */}
              <Rect
                width={width * 0.6}
                height={height * 0.3}
                fill={colors.center}
                stroke={colors.centerStroke}
                strokeWidth={1}
                offsetX={(width * 0.6) / 2}
                offsetY={(height * 0.3) / 2}
                cornerRadius={Math.min(width, height) * 0.05}
                opacity={isBooked ? 0.7 : 1}
              />
              
              {/* Booked indicator - diagonal lines */}
              {isBooked && (
                <>
                  <Line
                    points={[-width / 2, -height / 2, width / 2, height / 2]}
                    stroke="#4B5563"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                  <Line
                    points={[-width / 2, height / 2, width / 2, -height / 2]}
                    stroke="#4B5563"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                </>
              )}
            </>
          );
        }
        
        case "corner": {
          const width = (baseSize * (preset.size.width || 5)) / 100;
          const height = (baseSize * (preset.size.height || 5)) / 100;
          const cornerSize = width * 0.4;
          const chairs = getChairPositions("corner", table.seats, width, height);
          
          return (
            <>
              {/* Render chairs first (behind table) */}
              {chairs.map((chair, idx) => renderChair(chair.x, chair.y, chair.angle, isSelected || isBooked))}
              
              {/* Table top (on top of chairs) */}
              <Line
                points={[
                  0, 0,
                  width, 0,
                  width, cornerSize,
                  cornerSize, cornerSize,
                  cornerSize, height,
                  0, height
                ]}
                closed
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isSelected ? 4 : 3}
                offsetX={width / 2}
                offsetY={height / 2}
                lineJoin="round"
                opacity={isBooked ? 0.7 : 1}
              />
              
              {/* Table corner decorative */}
              <Rect
                width={cornerSize * 0.6}
                height={cornerSize * 0.6}
                fill={colors.center}
                stroke={colors.centerStroke}
                strokeWidth={1}
                offsetX={(cornerSize * 0.6) / 2}
                offsetY={(cornerSize * 0.6) / 2}
                x={cornerSize * 0.2}
                y={cornerSize * 0.2}
                cornerRadius={cornerSize * 0.1}
                opacity={isBooked ? 0.7 : 1}
              />
              
              {/* Booked indicator - diagonal lines */}
              {isBooked && (
                <>
                  <Line
                    points={[-width / 2, -height / 2, width / 2, height / 2]}
                    stroke="#4B5563"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                  <Line
                    points={[-width / 2, height / 2, width / 2, -height / 2]}
                    stroke="#4B5563"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                </>
              )}
            </>
          );
        }
        
        default:
          return null;
      }
    };

    return (
      <Group
        key={table.id}
        x={position.x}
        y={position.y}
        rotation={positionData.rotation || 0}
        onClick={() => !isBooked && onTableClick?.(table)}
        onTap={() => !isBooked && onTableClick?.(table)}
        listening={!isBooked}
      >
        {renderTableShape()}
      </Group>
    );
  };

  // Render bar/counter
  const renderBar = () => {
    const layoutTables = (window as any).__restaurantLayout as Array<{
      id: string;
      number: string;
      seats: number;
      type: TablePresetType;
      x: number;
      y: number;
      rotation?: number;
    }> || [];
    
    const bar = layoutTables.find(lt => lt.id === "bar-1");
    if (!bar) return null;
    
    const baseSize = Math.min(stageSize.width, stageSize.height);
    const barWidth = stageSize.width * 0.15; // 15% of width
    const barHeight = baseSize * 0.02; // 2% of base size
    
    return (
      <Group
        x={(stageSize.width * bar.x) / 100}
        y={(stageSize.height * bar.y) / 100}
      >
        <Rect
          width={barWidth}
          height={barHeight}
          fill="#c0c0c0"
          stroke="#999"
          strokeWidth={2}
        />
      </Group>
    );
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[400px] ${className}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-[400px] ${className}`}>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <BlockTitle>Restaurant Layout</BlockTitle>
        
        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#10B981] border-2 border-[#059669]"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#EF4444] border-2 border-[#DC2626]"></div>
            <span className="text-sm text-gray-700">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#8B1C3B] border-2 border-[#6E152F]"></div>
            <span className="text-sm text-gray-700">Selected</span>
          </div>
        </div>
      </div>
      <div 
        data-scheme-container
        className="border border-gray-200 rounded-xl overflow-hidden w-full"
        style={{ minHeight: "600px" }}
      >
        <Stage width={stageSize.width} height={stageSize.height} style={{ background: "#fafafa" }}>
          <Layer>
            {/* Walls */}
            {walls.map((wall, i) => (
              <Rect
                key={`wall-${i}`}
                x={wall.x}
                y={wall.y}
                width={wall.width}
                height={wall.height}
                fill="#666"
                stroke="#333"
                strokeWidth={1}
              />
            ))}

            {/* Bar/Counter */}
            {renderBar()}

            {/* Tables */}
            {tables.map((table, index) => renderTable(table, index))}
          </Layer>
        </Stage>
      </div>
      {tables.length === 0 && (
        <p className="text-center text-gray-600 mt-4">No tables available for this restaurant</p>
      )}
    </div>
  );
};

export default RestaurantScheme;