const ACTIONS = {
    JOIN: 'join',
    JOINED: 'joined',
    DISCONNECTED: 'disconnected',
    CODE_CHANGE: 'code-change',
    SYNC_CODE: 'sync-code',
    LEAVE: 'leave',
    DRAW_ACTION: 'draw-action', // For drawing actions
    SYNC_DRAWING: 'sync-drawing', // For synchronizing drawing state (optional)
    COMPILE: 'compile', // For triggering code compilation
    COMPILING: 'compiling', // For notifying clients that compilation is in progress
    COMPILE_RESULT: 'compile-result' // For sending compilation results to clients
};

module.exports = ACTIONS;
