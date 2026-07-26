'use client';

import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  StepIconProps,
  Typography,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Restaurant,
  DeliveryDining,
  DoneAll,
  LocalShipping,
  Star,
  Cancel
} from '@mui/icons-material';
import { OrderStatus } from '@/types/order';

interface OrderProgressProps {
  status: OrderStatus;
  completedAt?: string;
  theme: string;
}

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}

// Use enum values instead of string literals
const statusSteps: StatusStep[] = [
  { key: OrderStatus.PENDING, label: 'Order Placed', icon: Pending, color: '#ff9800' },
  { key: OrderStatus.CONFIRMED, label: 'Confirmed', icon: CheckCircle, color: '#2196f3' },
  { key: OrderStatus.PREPARING, label: 'Preparing', icon: Restaurant, color: '#9c27b0' },
  { key: OrderStatus.READY, label: 'Ready', icon: DeliveryDining, color: '#4caf50' },
  { key: OrderStatus.DELIVERING, label: 'Delivering', icon: LocalShipping, color: '#2196f3' },
  { key: OrderStatus.DELIVERED, label: 'Delivered', icon: DoneAll, color: '#4caf50' },
  { key: OrderStatus.RATED, label: 'Rated', icon: Star, color: '#ff9900' },
];

const getStepIndex = (status: OrderStatus): number => {
  const index = statusSteps.findIndex((step) => step.key === status);
  return index >= 0 ? index : 0;
};

interface CustomStepIconProps extends StepIconProps {
  theme: string;
}

const CustomStepIcon = (props: CustomStepIconProps) => {
  const { active, completed, icon, theme } = props;
  const stepIndex = typeof icon === 'number' ? icon : 0;
  const StepIcon = statusSteps[stepIndex]?.icon || Pending;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: completed
          ? (theme === 'dark' ? '#00ff00' : '#28a745')
          : active
          ? (theme === 'dark' ? '#00ffff' : '#007bff')
          : (theme === 'dark' ? '#334155' : '#e5e7eb'),
        color: active || completed ? '#ffffff' : (theme === 'dark' ? '#94a3b8' : '#999999'),
        transition: 'all 0.3s ease',
        boxShadow: active
          ? `0 0 20px ${theme === 'dark' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 123, 255, 0.3)'}`
          : 'none',
        transform: active ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <StepIcon sx={{ fontSize: 20 }} />
    </Box>
  );
};

export const OrderProgress: React.FC<OrderProgressProps> = ({
  status,
  completedAt,
  theme,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const activeStep = getStepIndex(status);

  if (status === 'CANCELLED') {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Cancel sx={{ fontSize: 48, color: '#dc3545' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#dc3545', fontWeight: 'bold' }}>
          Order Cancelled
        </Typography>
        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
          This order has been cancelled
        </Typography>
      </Box>
    );
  }

  if (status === 'RATED') {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Star sx={{ fontSize: 48, color: '#ff9900' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#ff9900', fontWeight: 'bold' }}>
          Order Completed & Rated
        </Typography>
        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
          Thank you for your feedback!
        </Typography>
        {completedAt && (
          <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'} sx={{ mt: 1, display: 'block' }}>
            Completed on {new Date(completedAt).toLocaleString()}
          </Typography>
        )}
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ width: '100%', py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {statusSteps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const isPending = index > activeStep;
            const StepIcon = step.icon;

            return (
              <Box
                key={step.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  opacity: isPending ? 0.5 : 1,
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  backgroundColor: isActive
                    ? (theme === 'dark' ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 123, 255, 0.1)')
                    : 'transparent',
                  borderLeft: isActive ? `3px solid ${step.color}` : '3px solid transparent',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: isCompleted
                      ? step.color
                      : isActive
                      ? step.color
                      : (theme === 'dark' ? '#334155' : '#e5e7eb'),
                    color: (isCompleted || isActive) ? '#ffffff' : (theme === 'dark' ? '#94a3b8' : '#999999'),
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle sx={{ fontSize: 16 }} />
                  ) : (
                    <StepIcon sx={{ fontSize: 16 }} />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isActive ? 'bold' : 'normal',
                      color: isActive ? step.color : (theme === 'dark' ? '#ccd6f6' : '#333333'),
                      fontSize: '0.85rem',
                    }}
                  >
                    {step.label}
                  </Typography>
                  {isActive && (
                    <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                      Current Status
                    </Typography>
                  )}
                  {isCompleted && (
                    <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                      Done
                    </Typography>
                  )}
                </Box>
                {isCompleted && (
                  <Box sx={{ color: step.color }}>
                    <CheckCircle sx={{ fontSize: 16 }} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center', color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
          <Typography variant="body2">
            {status === 'DELIVERED' && `Delivered on ${new Date(completedAt || '').toLocaleString()}`}
            {!['DELIVERED', 'CANCELLED', 'RATED'].includes(status) &&
              `Current Status: ${status.charAt(0) + status.slice(1).toLowerCase()}`}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 3 }}>
      <Stepper
        activeStep={activeStep}
        connector={
          <StepConnector
            sx={{
              '& .MuiStepConnector-line': {
                borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                borderWidth: 2,
              },
              '&.Mui-active .MuiStepConnector-line': {
                borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
              },
              '&.Mui-completed .MuiStepConnector-line': {
                borderColor: theme === 'dark' ? '#00ff00' : '#28a745',
              },
            }}
          />
        }
      >
        {statusSteps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;

          return (
            <Step key={step.key}>
              <StepLabel
                StepIconComponent={(props: StepIconProps) => (
                  <CustomStepIcon {...props} theme={theme} active={isActive} completed={isCompleted} />
                )}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: index <= activeStep
                      ? (theme === 'dark' ? '#ccd6f6' : '#333333')
                      : (theme === 'dark' ? '#94a3b8' : '#999999'),
                    fontWeight: index === activeStep ? 'bold' : 'normal',
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                    fontWeight: 'bold',
                  },
                  '& .MuiStepLabel-label.Mui-completed': {
                    color: theme === 'dark' ? '#00ff00' : '#28a745',
                  },
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Box sx={{ mt: 2, textAlign: 'center', color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
        <Typography variant="body2">
          {status === 'DELIVERED' && `Delivered on ${new Date(completedAt || '').toLocaleString()}`}
          {!['DELIVERED', 'CANCELLED', 'RATED'].includes(status) &&
            `Current Status: ${status.charAt(0) + status.slice(1).toLowerCase()}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default OrderProgress;