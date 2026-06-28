import React from 'react';
import { Check } from 'lucide-react';
import './ProductStepper.css';

const STEPS = [
  {
    number: 1,
    title: 'General',
    // subtitle: 'Product identity and Description',
  },
  {
    number: 2,
    title: 'Media',
    // subtitle: 'Price, Inventory & Product Variants',
  },
  {
    number: 3,
    title: 'Variants & Inventory',
    // subtitle: 'Product identity and Description',
  },
  {
    number: 4,
    title: 'Shipping',
    // subtitle: 'Legal status ,SEO & Publishing',
  },
  {
    number: 5,
    title: 'Marketing & Publishing',
    // subtitle: 'Review your product before publishing',
  }

];

const ProductStepper = ({ activeStep = 1, completedSteps = [] }) => {
  return (
    <div className="product-stepper">
      {STEPS.map((step) => {
        const isActive = step.number === activeStep;
        const isCompleted = completedSteps.includes(step.number);

        return (
          <div
            key={step.number}
            className={`stepper-item ${isActive ? 'stepper-item--active' : ''} ${isCompleted ? 'stepper-item--completed' : ''}`}
          >
            <div className="stepper-item__line" />
            <div className="stepper-item__content">
              <div className="stepper-item__icon">
                {isCompleted ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  <div className="stepper-item__dot" />
                )}
              </div>
              <div className="stepper-item__number">{step.number}.</div>
              <div className="stepper-item__text">
                <span className="stepper-item__title">{step.title}</span>
                <span className="stepper-item__subtitle">{step.subtitle}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductStepper;