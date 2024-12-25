// Adding use client to overcome "Error: Functions cannot be passed directly to Client Components..."
'use client';

import dynamic from 'next/dynamic';
import { type RegisteredComponent } from '@builder.io/sdk-react';
// Altenatively use react lazy rather than dynamic to overcome "Error: Functions cannot be passed directly to Client Components..."
// import { lazy } from 'react';

export const customComponents: RegisteredComponent[] = [
  {
    component: dynamic(() => import('./MyFunComponent')),
    // component: lazy(() => import('./MyFunComponent')),
    name: 'Text', // Override the default text component so that it actually renders
    inputs: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'Hello world',
      },
    ],
  },
];
