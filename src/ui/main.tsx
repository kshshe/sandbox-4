import React from 'react';
import { createRoot } from 'react-dom/client';

import { ElementsPanel } from './views/elements-panel/elements-panel';

const body = document.querySelector('#react');
if (body) {
    createRoot(body).render(<ElementsPanel />);
}