import React from 'react';
import { Box, Paper, Typography, IconButton, alpha } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { CheckCircle } from '@mui/icons-material';
import dayjs from 'dayjs';

interface TimelineItem {
  id: number;
  nombre: string;
  creado_en: string | Date | null;
}

interface CustomTimelineProps {
  items: TimelineItem[];
  onDelete: (id: number) => void;
}

export const CustomTimeline: React.FC<CustomTimelineProps> = ({ items, onDelete }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {items.length > 0 ? (
        items.map((item, _index) => (
          <Box 
            key={`timeline-item-${item.id}`}
            sx={{ 
              display: 'flex', 
              gap: 2,
              pb: 3,
              position: 'relative',
              '&:not(:last-child)::before': {
                content: '""',
                position: 'absolute',
                left: '15px',
                top: '48px',
                bottom: '-24px',
                width: '2px',
                backgroundColor: 'success.light',
              }
            }}
          >
            {/* Dot */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                minWidth: '32px',
                minHeight: '32px',
                borderRadius: '50%',
                backgroundColor: 'success.main',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.15)',
              }}
            >
              <CheckCircle sx={{ color: 'white', fontSize: '20px', lineHeight: 0 }} />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
              {/* Date */}
              <Typography 
                variant='caption' 
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 0.5,
                  fontSize: '0.75rem'
                }}
              >
                {dayjs(item.creado_en).format('DD/MM/YYYY')}
              </Typography>

              {/* Result Card */}
              <Paper 
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha('#4CAF50', 0.05),
                  border: `1px solid ${alpha('#4CAF50', 0.2)}`,
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography 
                  variant='body2' 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    flex: 1,
                    wordBreak: 'break-word'
                  }}
                >
                  {item.nombre}
                </Typography>
                <IconButton 
                  onClick={() => onDelete(item.id)} 
                  aria-label="delete" 
                  color='error' 
                  size='small'
                  sx={{ 
                    flexShrink: 0,
                    ml: 'auto'
                  }}
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </Paper>
            </Box>
          </Box>
        ))
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant='body2' color='text.secondary'>
            Sin resultados consolidados aún
          </Typography>
        </Box>
      )}
    </Box>
  );
};
