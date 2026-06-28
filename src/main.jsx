
import './index.css'

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import Loading from "./components/Loading/Loading";
import { initI18n } from "./i18n/i18n";
import { store } from "./store/store";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

initI18n().then(() => {
  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="loading-page-loading">
              <Loading loadingPages={true} />
            </div>
          }
        >
          <App />
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
});

