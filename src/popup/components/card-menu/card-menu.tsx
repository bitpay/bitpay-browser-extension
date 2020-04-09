import React, { forwardRef, useImperativeHandle } from 'react';
import './card-menu.scss';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';

const CardMenu: React.FC<{ items: string[]; onClick: (arg0: string) => void }> = forwardRef(
  ({ items, onClick }, ref) => {
    const popupState = usePopupState({ variant: 'popover', popupId: 'cardActions' });
    useImperativeHandle(ref, () => ({
      close(): void {
        popupState.close();
      }
    }));
    return (
      <>
        <button className="card-menu__icon" type="button" {...bindTrigger(popupState)}>
          <img src="../../assets/icons/dots.svg" alt="More" />
        </button>
        <Menu
          {...bindMenu(popupState)}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          className="card-menu"
          style={{ boxShadow: 'none' }}
        >
          {items.map((option: string, index: number) => (
            <MenuItem className="card-menu__item" key={index} onClick={(): void => onClick(option)}>
              {option}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
);

export default CardMenu;
