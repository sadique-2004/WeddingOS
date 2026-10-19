import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import OrganizerLayout from '../layouts/OrganizerLayout'
import HomePage from '../../pages/HomePage'
import AboutPage from '../../pages/AboutPage'
import NotFoundPage from '../../pages/NotFoundPage'
import SignInPage from '../../pages/auth/SignInPage'
import SignUpPage from '../../pages/auth/SignUpPage'
import WorkspaceOnboardingPage from '../../pages/onboarding/WorkspaceOnboardingPage'
import DashboardPage from '../../pages/dashboard/DashboardPage'
import EventsPage from '../../pages/events/EventsPage'
import TasksPage from '../../pages/tasks/TasksPage'
import InvitationsPage from '../../pages/invitations/InvitationsPage'
import ExpensesPage from '../../pages/expenses/ExpensesPage'
import VendorsPage from '../../pages/vendors/VendorsPage'
import ProtectedRoute from '../components/ProtectedRoute'

import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/sso-callback',
    element: <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/app/onboarding" signInForceRedirectUrl="/app/dashboard" />,
  },
  {
    path: '/app/onboarding',
    element: (
      <ProtectedRoute>
        <WorkspaceOnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <OrganizerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'invitations',
        element: <InvitationsPage />,
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
      },
      {
        path: 'vendors',
        element: <VendorsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <RootLayout />,
    children: [
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

