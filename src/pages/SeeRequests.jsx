import React from "react";
import { useParams } from "react-router-dom";

const SeeRequests = () => {
  const { UserID } = useParams();
  return <div>SeeRequests {UserID}</div>;
};

export default SeeRequests;
