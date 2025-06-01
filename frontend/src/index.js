// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import AuthWrapper from "./AuthWrapper";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_SAdp54SK6",
  client_id: "3vm5en50l8he987f9vnemu7ml5",
  redirect_uri: "http://localhost:5173/",
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);