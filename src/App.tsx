/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CMSProvider, useCMS } from './context/CMSContext';
import Navigation from './components/Navigation';
import ReaderView from './components/ReaderView';
import AdminPanel from './components/AdminPanel';

function AppContent() {
  const { isAdminMode } = useCMS();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Universal responsive navigation header */}
      <Navigation />
      
      {/* Conditional rendering between the Administrative Panel and Reader Mode */}
      <main className="flex-1">
        {isAdminMode ? (
          <AdminPanel />
        ) : (
          <ReaderView />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <AppContent />
    </CMSProvider>
  );
}

