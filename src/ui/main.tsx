import React from 'react';
import { createRoot } from 'react-dom/client';

import { ElementsPanel } from './views/elements-panel/elements-panel';
import { SettingsPanel } from './views/settings-panel/settings-panel';
import { ResetButton } from './views/reset-button/reset-button';

const body = document.querySelector('#react');
if (body) {
    createRoot(body).render(<>
        <ElementsPanel />
        <SettingsPanel />
        <ResetButton />
    </>);
}