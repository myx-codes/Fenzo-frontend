import React from "react";
import { NavLink } from "react-router-dom";

export function Brand() {
  return <NavLink to="/" className="fz-brand" aria-label="FENZO home">
    <span className="fz-brand-mark"><img src="/icons/logoIcon.png" alt="" /></span>
    <span className="fz-brand-wordmark">FENZO</span>
  </NavLink>;
}
