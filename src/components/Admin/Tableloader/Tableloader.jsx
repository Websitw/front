import Skeleton from "@mui/material/Skeleton";
import "./TableLoader.css";

const TableLoader = ({ rows = 8, columns = 6 }) => {
  return (
    <div className="table-loader-container">
      <div className="table-loader-header">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="table-loader-header-cell">
            <Skeleton variant="text" width="80%" height={24} animation="wave" />
          </div>
        ))}
      </div>
      <div className="table-loader-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="table-loader-row">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="table-loader-cell">
                {colIndex === columns - 1 ? (
                  <Skeleton variant="circular" width={40} height={40} animation="wave" />
                ) : (
                  <Skeleton variant="text" width="100%" height={20} animation="wave" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableLoader;