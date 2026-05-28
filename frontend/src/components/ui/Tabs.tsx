'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex gap-2 border-b border-slate-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
