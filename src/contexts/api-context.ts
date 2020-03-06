import React from "react";
import D2Api from "d2-api";

const defaultApi = new D2Api({ baseUrl: "http://localhost:8080" });
export const ApiContext = React.createContext<D2Api>(defaultApi);
