import React from 'react';

interface DashboardLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ sidebar, children }) => {
    return (
        <div className="flex h-screen bg-white dark:bg-[#212121] text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-200">
            {/* Sidebar Area */}
            <aside className="hidden md:block flex-shrink-0 h-full">
                {sidebar}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-[#212121] transition-colors duration-200">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
