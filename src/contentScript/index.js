import React from "react";
import ReactDOM from "react-dom";
import ContentScript from "./ContentScript";

const mount = document.createElement("span");
const id = "invisible-mount-point";
mount.id = id;
mount.style.display = "none";
document.body.appendChild(mount);

ReactDOM.render(
  <React.StrictMode>
    <ContentScript />
  </React.StrictMode>,
  document.getElementById(id)
);
