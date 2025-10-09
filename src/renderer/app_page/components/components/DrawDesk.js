import './DrawDesk.scss';

import React, { useEffect, useRef } from 'react';
import { getMouseCoordinates } from '../utils/general.js';
import {
  drawPen,
  drawHighlighter,
  drawLine,
  drawLineActive,
  drawArrow,
  drawArrowActive,
  drawOval,
  drawOvalActive,
  drawRectangle,
  drawRectangleActive,
  drawBox,
  drawBoxActive,
  drawLaser,
  drawEraserTail,
  drawText,
} from './drawer/figures.js';

const DrawDesk = ({
  allFigures,
  allLaserFigures,
  allEraserFigures,
  activeFigureInfo,
  cursorType,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleDoubleClick,
  handleWillStartDrawing,
  updateRainbowColorDeg,
}) => {
  // console.log('DrawDesk render');
  const canvasRef = useRef(null);
  const dpr = window.devicePixelRatio || 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);

    ctx.scale(dpr, dpr);

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }, []);

  useEffect(() => {
    draw(allFigures, allLaserFigures, allEraserFigures, activeFigureInfo)
  }, [allFigures, allLaserFigures, allEraserFigures, activeFigureInfo]);

  const draw = (allFigures, allLaserFigures, allEraserFigures, activeFigureInfo) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    allFigures.forEach((figure) => {
      // Apply per-figure opacity for fade-out animation
      ctx.save();
      const alpha = (figure.opacity !== undefined) ? figure.opacity : 1;
      ctx.globalAlpha = alpha;

      if (figure.type === 'pen') {
        drawPen(ctx, figure, updateRainbowColorDeg)
      }

      if (figure.type === 'highlighter') {
        drawHighlighter(ctx, figure)
      }

      if (figure.type === 'arrow') {
        drawArrow(ctx, figure, updateRainbowColorDeg)
      }

      if (figure.type === 'line') {
        drawLine(ctx, figure, updateRainbowColorDeg)
      }

      if (figure.type === 'rectangle') {
        drawRectangle(ctx, figure, updateRainbowColorDeg)
      }

      if (figure.type === 'oval') {
        drawOval(ctx, figure, updateRainbowColorDeg)
      }

      if (figure.type === 'text') {
        drawText(ctx, figure, updateRainbowColorDeg, Boolean(activeFigureInfo && figure.id === activeFigureInfo.id))
      }

      ctx.restore();

      // Draw active handles/overlays at full opacity
      if (activeFigureInfo && figure.id === activeFigureInfo.id) {
        if (figure.type === 'arrow') {
          drawArrowActive(ctx, figure)
        }
        if (figure.type === 'line') {
          drawLineActive(ctx, figure)
        }
        if (figure.type === 'rectangle') {
          drawRectangleActive(ctx, figure)
        }
        if (figure.type === 'oval') {
          drawOvalActive(ctx, figure)
        }
      }
    })

    allLaserFigures.forEach((figure) => {
      drawLaser(ctx, figure)
    })

    allEraserFigures.forEach((figure) => {
      drawEraserTail(ctx, figure)
    })
  };

  const onMouseDown = (event) => {
    if(event.button === 2) return;

    const coordinates = getMouseCoordinates(event)

    // 当即将开始绘制时，先关闭 click-through，防止底层应用收到点击
    if (handleWillStartDrawing(coordinates)) {
      window.electronAPI.invokeSetIgnoreMouseEvents(false);
      event.preventDefault();
    }

    handleMouseDown(coordinates);
    // event.stopPropagation();
  }

  const onMouseMove = (event) => {
    const coordinates = getMouseCoordinates(event)

    // 根据当前位置判断是否可能开始绘制
    // 如果会绘制，则关闭 click-through，否则开启以便底层可交互
    try {
      if (handleWillStartDrawing(coordinates)) {
        window.electronAPI.invokeSetIgnoreMouseEvents(false);
      } else {
        window.electronAPI.invokeSetIgnoreMouseEvents(true);
      }
    } catch (_) {}

    handleMouseMove(coordinates);
  }

  const onMouseUp = (event) => {
    const coordinates = getMouseCoordinates(event)

    handleMouseUp(coordinates);

    // 鼠标抬起后恢复 click-through，让底层继续可交互
    try { window.electronAPI.invokeSetIgnoreMouseEvents(true); } catch (_) {}
  }

  const onDoubleClick = (event) => {
    const coordinates = getMouseCoordinates(event);

    handleDoubleClick(coordinates);
  }

  return (
    <canvas
      id="canvas"
      ref={canvasRef}
      style={{ cursor: cursorType }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
    />
  );
};

export default DrawDesk;
