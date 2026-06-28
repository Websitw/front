import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CustomToast.css';
import {
    CheckCircle,
    AlertTriangle,
    Info
} from '../../assets/icons';

const CustomToast = ({ type, title, message }) => {
  const icons = {
    success: <CheckCircle size={24} />,
    error: <AlertTriangle size={24} />,
    info: <Info size={24} />
  };

  return (
    <div className="custom-toast-content">
      <div className="custom-toast-icon">{icons[type]}</div>
      <div className="custom-toast-text">
        <div className="custom-toast-title">{title}</div>
        <div className="custom-toast-message">{message}</div>
      </div>
    </div>
  );
};

export const showToast = {
  success: (title, message) => {
    toast(<CustomToast type="success" title={title} message={message} />, {
      icon: false,
      className: 'custom-toast custom-toast-success',
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      pauseOnFocusLoss: false,
      closeButton: false
    });
  },
  error: (title, message) => {
    toast(<CustomToast type="error" title={title} message={message} />, {
      icon: false,
      className: 'custom-toast custom-toast-error',
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      pauseOnFocusLoss: false,
      closeButton: false
    });
  },
  info: (title, message) => {
    toast(<CustomToast type="info" title={title} message={message} />, {
      icon: false,
      className: 'custom-toast custom-toast-info',
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      pauseOnFocusLoss: false,
      closeButton: false
    });
  }
};