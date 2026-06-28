

import { useState, useEffect } from "react";

const PdfViewer = ({ url }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let objectUrl = null;

    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(url);

        if (!response.ok) throw new Error("Failed to fetch PDF");

        const blob = await response.blob();

        objectUrl = URL.createObjectURL(
          new Blob([blob], { type: "application/pdf" })
        );

        setBlobUrl(objectUrl);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  if (loading) return <p>Loading PDF...</p>;

  if (error) {
    return (

      // Failed to load PDF or
      <p

      style={{
        color:"#121212",
        fontSize:"18px",
        fontWeight:'400',
        padding:'0 5px'
      }}
      >
         no data uploaded.{" "}
        {/* <a href={url} target="_blank" rel="noopener noreferrer">
          Download instead
        </a> */}
      </p>
    );
  }

  if (!blobUrl) {
    return <p>No data uploaded</p>;
  }

  return (
    <object
      data={blobUrl}
      type="application/pdf"
      width="100%"
      height="600px"
      style={{
        borderRadius: "8px",
        border: "1px solid #eee",
        overflow: "scroll",
      }}
    >
      <p>
        Your browser doesn't support PDF viewing.{" "}
        <a href={url} target="_blank" rel="noopener noreferrer">
          Download PDF
        </a>
      </p>
    </object>
  );
};

export default PdfViewer;
