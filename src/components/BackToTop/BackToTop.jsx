import { useCallback } from 'react';
import './BackToTop.css';
import chevronsImage from '../../assets/brands/chevrons-up.png'
import whiteArrow from '../../assets/icons/whiteArrow.svg'

const BackToTop = ({
  text = 'Back to top of page',
  className = '',
  onClick,
  backgroundColor,
  fontColor,
  isDarkMode = false
}) => {

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <button
      className={`back-to-top ${className}`}
      style={{ backgroundColor: backgroundColor }}
      onClick={scrollToTop}
      aria-label={text}
      type="button"
    >
      <div className="back-to-top__content">
        <span aria-hidden="true">
         {!isDarkMode ? <img src={whiteArrow} alt={text}/> : 
         <img src={chevronsImage} alt={text}/>
         }
        </span>
        <span style={{
          color: fontColor
        }} className="back-to-top__text">{text}</span>
      </div>
    </button>
  );
};


export default BackToTop;