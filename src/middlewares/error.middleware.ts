import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1️⃣ Determine HTTP status code
  const statusCode = err instanceof AppError
    ? err.statusCode   // use our custom code when it’s an AppError
    : 500;             // otherwise, treat as “Internal Server Error”

  // 2️⃣ Determine client‐facing message
  const message = err instanceof AppError
    ? err.message      // use the descriptive message we provided
    : "An unexpected error occurred";  
                       // fallback for unknown errors

  // 3️⃣ Build the JSON response body
  const responseBody: { status: "fail" | "error"; message: string; stack?: string } = {
    status: statusCode < 500 ? "fail" : "error",
    message,
  };

  // 4️⃣ In development, include the stack trace for debugging
  if (process.env.NODE_ENV !== "production") {
    responseBody.stack = err.stack; 
  }

  // 5️⃣ Send the response
  res.status(statusCode).json(responseBody);
};
