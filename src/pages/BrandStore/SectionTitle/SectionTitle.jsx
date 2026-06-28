const SectionTitle = ({ title }) => {
  const ArrowRightIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <div className="best-seller-section__header">
        <div className="best-seller-section__title-wrapper">
          <h2
            style={{
              color: "#FFF"
            }}
            className="section-title">{title}

            {title === 'Recommended for You' &&

              <div class="sale-badge">
                <span>30% Sale</span>
              </div>
            }
          </h2>
        </div>

      </div>
    </>
  );
};

export default SectionTitle;
