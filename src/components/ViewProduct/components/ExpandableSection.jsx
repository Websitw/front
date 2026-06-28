import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ExpandableSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`expandable-section ${isOpen ? "open" : ""}`}>
      <button type="button" className="expand-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="expand-title">{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <div className="expand-content">{children}</div>
    </div>
  );
}

export default ExpandableSection;