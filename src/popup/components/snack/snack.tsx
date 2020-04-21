import React from 'react';
import { Snackbar, SnackbarOrigin } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import IconButton from '@material-ui/core/IconButton';
import './snack.scss';

const position: React.CSSProperties = { top: '15px', left: '15px', right: '15px' };
const anchorOrigin: SnackbarOrigin = { vertical: 'top', horizontal: 'center' };
const menu: React.CSSProperties = {
  textAlign: 'left',
  background: '#081125',
  borderRadius: '9px',
  color: 'rgba(255, 255, 255, .75)',
  fontSize: '12px'
};
const icon: React.CSSProperties = { color: 'rgba(255, 255, 255, 0.5)' };
const title: React.CSSProperties = { color: 'white', fontSize: '15px' };

const Snack: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="snack">
    <Snackbar style={position} open={!!message} autoHideDuration={6000} anchorOrigin={anchorOrigin} onClose={onClose}>
      <Alert
        style={menu}
        severity="error"
        action={
          <IconButton aria-label="close" color="inherit" size="small" style={icon} onClick={onClose}>
            <img src="/assets/icons/close.svg" alt="close" />
          </IconButton>
        }
      >
        <AlertTitle style={title}>Please Try Again!</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  </div>
);

export default Snack;
