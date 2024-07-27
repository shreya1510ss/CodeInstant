import React, { useState, useRef, useEffect } from 'react';
import ACTIONS from '../Actions'; // Ensure this is the correct path for your actions

const Whiteboard = ({ socketRef, roomid }) => {
  const [color, setColor] = useState('#ffffff'); // Default color changed to white
  const [tool, setTool] = useState('pencil');
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const updateCanvasSize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas after resizing
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      // Listen for drawing actions from other clients
      socketRef.current.on(ACTIONS.DRAW_ACTION, (data) => {
        const { tool, color, startX, startY, x, y } = data;
        const ctx = canvasRef.current.getContext('2d');

        if (tool === 'pencil') {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (tool === 'eraser') {
          ctx.clearRect(x - 10, y - 10, 20, 20); // Erase in a 20x20 px area
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.DRAW_ACTION);
      }
    };
  }, [socketRef.current]);

  const startDrawing = (e) => {
    isDrawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    startX.current = e.nativeEvent.offsetX;
    startY.current = e.nativeEvent.offsetY;
    if (tool === 'pencil') {
      ctx.beginPath();
      ctx.moveTo(startX.current, startY.current);
    }
  };

  const draw = (e) => {
    if (!isDrawing.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (tool === 'pencil') {
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      // Emit drawing action to other clients
      socketRef.current.emit(ACTIONS.DRAW_ACTION, {
        tool,
        color,
        startX: startX.current,
        startY: startY.current,
        x,
        y,
        roomid,
      });
      startX.current = x;
      startY.current = y;
    } else if (tool === 'eraser') {
      ctx.clearRect(x - 10, y - 10, 60, 60); // Erase in a 20x20 px area
      // Emit eraser action to other clients
      socketRef.current.emit(ACTIONS.DRAW_ACTION, {
        tool,
        color,
        startX: x,
        startY: y,
        x,
        y,
        roomid,
      });
    }
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const handleToolToggle = (selectedTool) => {
    setTool(selectedTool);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', color: '#ddd' }}>
          Color:
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            style={{
              marginLeft: '10px',
              border: 'none',
              borderRadius: '5px',
              padding: '5px',
              cursor: 'pointer',
            }}
          />
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => handleToolToggle('pencil')}
            style={{
              backgroundColor: tool === 'pencil' ? '#0000FF' : '#333',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            Pencil
          </button>
          <button
            onClick={() => handleToolToggle('eraser')}
            style={{
              backgroundColor: tool === 'eraser' ? '#0000FF' : '#333',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            Eraser
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ border: '2px solid #444', backgroundColor: '#222' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
