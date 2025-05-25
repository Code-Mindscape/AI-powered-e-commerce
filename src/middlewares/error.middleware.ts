import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

type ErrorResponse = {
  status: "fail" | "error";
  message: string;
  stack?: string;
};

type Environment = "production" | "development" | "test";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const environment = process.env.NODE_ENV as Environment;
  const isProduction = environment === "production";
  
  // Determine HTTP status code
  const statusCode = isAppError ? err.statusCode : 500;
  
  // Determine client-facing message
  const clientMessage = isAppError
    ? err.message
    : isProduction
    ? "An unexpected error occurred"
    : err.message;

  // Construct response body
  const response: ErrorResponse = {
    status: statusCode < 500 ? "fail" : "error",
    message: clientMessage,
  };

  // Add stack trace in non-production environments
  if (!isProduction) {
    response.stack = err.stack;
    
    // Optional: Log full error details in development
    console.error(`[${new Date().toISOString()}] Error:`, {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send error response
  res.status(statusCode).json(response);
};