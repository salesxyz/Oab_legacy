import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Carregamos apenas os subsets "latin" e "latin-ext" (cobrem todos os
// acentos do português) em vez do pacote completo do @fontsource, que
// também inclui cyrillic, greek e vietnamese — desnecessários aqui e que
// só inflariam o build.
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import '@fontsource/manrope/latin-ext-700.css';
import '@fontsource/manrope/latin-ext-800.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-ext-400.css';
import '@fontsource/inter/latin-ext-500.css';
import '@fontsource/inter/latin-ext-600.css';

import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
