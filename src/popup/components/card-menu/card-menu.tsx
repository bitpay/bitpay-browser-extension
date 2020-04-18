import React from 'react';
import './card-menu.scss';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';

const CardMenu: React.FC<{ items: string[]; onClick: (arg0: string) => void }> = ({ items, onClick }) => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'cardActions' });
  const itemClick = (item: string): void => {
    onClick(item);
    popupState.close();
  };
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
      >
        {items.map((option: string, index: number) => (
          <MenuItem className="card-menu__item" key={index} onClick={(): void => itemClick(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CardMenu;
