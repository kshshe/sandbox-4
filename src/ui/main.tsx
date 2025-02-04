import './scss.d.ts';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { ElementsPanel } from './views/elements-panel/elements-panel';
import { SettingsPanel } from './views/settings-panel/settings-panel';
import { Metrics } from './views/metrics/metrics';
import { ControlButtons } from './views/control-buttons/control-buttons.tsx';

const body = document.querySelector('#react');
if (body) {
    createRoot(body).render(<>
        <ElementsPanel />
        <SettingsPanel />
        <ControlButtons />
        <Metrics />
    </>);
}