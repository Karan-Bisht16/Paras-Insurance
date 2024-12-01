import React from 'react';

export function ScrollArea({ children, className = '' }) {
    return (
        <div className={`overflow-auto ${className}`}>
            {children}
        </div>
    );
}