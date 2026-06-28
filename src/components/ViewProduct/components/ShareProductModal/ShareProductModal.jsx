import { useState, useEffect, useRef, useCallback } from "react";
import { X, Copy, Check, MoreHorizontal } from "lucide-react";
import "./ShareProductModal.css";
import { FaceBook, Messnger, Twitter, WhatsApp } from "../../../../assets/icons";

const SOCIAL_PLATFORMS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: <WhatsApp/>,
    getShareUrl: (url) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: <FaceBook/>,
    getShareUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "messenger",
    label: "Massinger",
    icon: <Messnger/>,
    getShareUrl: (url) =>
      `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    icon: <Twitter/>,
    getShareUrl: (url) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    id: "other",
    label: "Other",
    icon: <MoreHorizontal size={24} color="#333333" />,
    getShareUrl: null,
  },
];

function ShareProductModal({ isOpen, onClose, productUrl = "" }) {
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef(null);
  const shareUrl = productUrl || "Https://Sawa.com/product/sku";

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setCopied(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleShare = useCallback(
    async (platform) => {
      if (platform.id === "other") {
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Check out this product",
              url: shareUrl,
            });
          } catch {
            return;
          }
        }
        return;
      }

      if (platform.getShareUrl) {
        window.open(platform.getShareUrl(shareUrl), "_blank", "noopener,noreferrer");
      }
    },
    [shareUrl]
  );

  if (!isOpen) return null;

  return (
    <div
      className="share-modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="share-modal-container">
        <div className="share-modal-header">
          <h2 className="share-modal-title">Share Product</h2>
          <button
            type="button"
            className="share-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        <p className="share-modal-subtitle">Share this link via</p>

        <div className="share-social-row">
          {SOCIAL_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              className="share-social-item"
              onClick={() => handleShare(platform)}
            >
              <div className="share-social-icon">{platform.icon}</div>
              <span className="share-social-label">{platform.label}</span>
            </button>
          ))}
        </div>

        <div className="share-modal-divider" />

        <p className="share-copy-title">Copy the link</p>

        <div className="share-copy-input-wrapper">
          <input
            type="text"
            className="share-copy-input"
            value={shareUrl}
            readOnly
          />
          <button
            type="button"
            className="share-copy-btn"
            onClick={handleCopyLink}
            aria-label={copied ? "Copied" : "Copy link"}
          >
            {copied ? (
              <Check size={18} color="#0D7C85" />
            ) : (
              <Copy size={18} color="#666666" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareProductModal;