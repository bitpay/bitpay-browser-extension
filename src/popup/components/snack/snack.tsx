import React from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import IconButton from '@material-ui/core/IconButton';
import './snack.scss';

const Snack: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="snack">
    <Snackbar
      style={{ top: '15px', left: '15px', right: '15px' }}
      open={!!message}
      autoHideDuration={6000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={onClose}
    >
      <Alert
        style={{
          textAlign: 'left',
          background: '#081125',
          borderRadius: '9px',
          color: 'rgba(255, 255, 255, .75)',
          fontSize: '12px'
        }}
        severity="error"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            onClick={onClose}
          >
            <img src="/assets/icons/close.svg" alt="close" />
          </IconButton>
        }
      >
        <AlertTitle style={{ color: 'white', fontSize: '15px' }}>Please Try Again!</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  </div>
);

export default Snack;
