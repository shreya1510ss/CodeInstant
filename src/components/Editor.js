import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import { useEditor } from '../context/EditorContext';

const Editor = ({ socketRef, roomid, onCodeChange }) => {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const { code, setCode } = useEditor();

  

  useEffect(() => {
    async function init() {
      if (textareaRef.current) {
        editorRef.current = Codemirror.fromTextArea(
          textareaRef.current,
          {
            mode: { name: 'javascript', json: true },
            theme: 'dracula',
            autoCloseTags: true,
            autoCloseBrackets: true,
            lineNumbers: true,
          }
        );

        // Set the initial code from context
        editorRef.current.setValue(code);

        editorRef.current.on('change', (instance, changes) => {
          const { origin } = changes;
          const code = instance.getValue();
          onCodeChange(code);
          setCode(code);
          if (origin !== 'setValue') {
            // Update context with new code
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomid,
              code,
            });

          
          }
        });
      }
    }

    init();

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.getWrapperElement().remove();
          editorRef.current = null;
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);





  return (
    <div>
      <textarea ref={textareaRef} id="realtimeEditor"></textarea>
      
    </div>
  );
};

export default Editor;
