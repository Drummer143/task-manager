import { AxiosError } from "axios";

import { ApiError } from "./types";

type ErrorMap = Record<string | number, string>;

const defaultErrorMap: ErrorMap = {
  unknown: "Unknown error. Please reload the page and try again",
  400: "Bad request",
  401: "Unauthorized",
  403: "Access denied",
  404: "Not found",
  500: "Internal server error. Please reload the page and try again"
};

export const parseApiError = (
  error?: Error | null | AxiosError,
  customErrorHandle?: ErrorMap,
  takeMessageFromError?: boolean | number[],
  errorIfEmpty?: boolean
) => {
  if (!error || !(error instanceof AxiosError)) {
    if (!errorIfEmpty) {
      return;
    }

    return defaultErrorMap["unknown"];
  }

  if (!error.response) {
    return defaultErrorMap["unknown"];
  }

  const errorData = error.response.data as ApiError;

  if (takeMessageFromError && errorData) {
    if (takeMessageFromError === true) {
      return errorData.message;
    }

    if (takeMessageFromError.includes(errorData.statusCode)) {
      return errorData.message;
    }
  }

  return (
    customErrorHandle?.[errorData.statusCode] ||
    defaultErrorMap[error.response.status] ||
    defaultErrorMap["unknown"]
  );
};
