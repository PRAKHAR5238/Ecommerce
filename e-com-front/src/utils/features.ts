import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";
import moment from "moment";

import { MessageResponse } from "../types/api-types"; // ✅ Use imported type
import { SerializedError } from "@reduxjs/toolkit";

type ResType = {
  data?: { message: string };
  error?: FetchBaseQueryError | SerializedError; // ✅ Accept both error types
};


// ✅ Improved Error Handling in responseToast
export const responseToast = (
  res: ResType,
  navigate: NavigateFunction | null,
  url: string
) => {
  if (res.data?.message) {
    toast.success(res.data.message);
    if (navigate) navigate(url);
  } else if (res.error) {
    let errorMessage = "Something went wrong!";

    if ("data" in res.error && typeof res.error.data === "object") {
      const messageResponse = res.error.data as MessageResponse;
      errorMessage = messageResponse?.message || errorMessage;
    } else if ("message" in res.error) {
      errorMessage = res.error.message || errorMessage;
    }

    toast.error(errorMessage);
  } else {
    toast.error("An unexpected error occurred.");
  }
};


// ✅ Optimized getLastMonths Function
export const getLastMonths = () => {
  const currentDate = moment();

  currentDate.date(1);

  const last6Months: string[] = [];
  const last12Months: string[] = [];

  for (let i = 0; i < 6; i++) {
    const monthDate = currentDate.clone().subtract(i, "months");
    const monthName = monthDate.format("MMMM");
    last6Months.unshift(monthName);
  }

  for (let i = 0; i < 12; i++) {
    const monthDate = currentDate.clone().subtract(i, "months");
    const monthName = monthDate.format("MMMM");
    last12Months.unshift(monthName);
  }

  return {
    last12Months,
    last6Months,
  };
};